
-- 1. Upsert from gadm to geo_region converting geometry to H3
INSERT INTO geo_region 
    ("name", "h3Compact", "theGeom")

SELECT
    path_id,
    array(
        SELECT h3_compact(array(
            SELECT h3_polyfill(wkb_geometry, 6)
        ))
    ) AS "h3Compact",
    wkb_geometry
FROM gadm_levels0_2
ON CONFLICT (name) DO UPDATE SET
    "h3Compact" = EXCLUDED."h3Compact",
    "theGeom" = EXCLUDED."theGeom";

-- 2. Insert into admin_region referencing geo_region
BEGIN;

-- 2.1 Create the records
INSERT INTO admin_region 
    ("name", "gadmId", "geoRegionId", "isoA3")
SELECT 
    gadm_levels0_2.name, 
    gadm_levels0_2.path_id, 
    geo_region.id, 
    CASE 
        WHEN gadm_levels0_2.GID_0 = gadm_levels0_2.path_id THEN gadm_levels0_2.GID_0
        ELSE null
    END
FROM geo_region
    LEFT JOIN gadm_levels0_2 ON geo_region.name = gadm_levels0_2.mpath
ON CONFLICT ("gadmId") DO UPDATE SET
    "geoRegionId" = EXCLUDED."geoRegionId";

-- 2.2 Build the tree from the gadmId which is a materialized path
UPDATE admin_region child
SET "parentId" = parent.id
FROM admin_region parent
WHERE child."gadmId" LIKE parent."gadmId" || '_%' AND child.mpath NOT LIKE parent."gadmId" || '_%._%';

-- 2.3 Create the id-based materialized path as `parent.mpath`.`child.id` from 
-- the tree as this is usually created by TypeORM
WITH q AS (
    SELECT ancestor.id, ancestor.id AS mpath
    FROM admin_region ancestor
    WHERE "parentId" is null
    UNION ALL
    SELECT child.id, CONCAT(q.mpath, '.', child.id) as mpath
    FROM admin_region child
    WHERE child."parentId" = q.id
)
UPDATE admin_region
SET mpath = q.mpath
FROM q
WHERE admin_region.id = q.id;

COMMIT;

-- 3. add ISOa2 codes from csv
BEGIN;

CREATE TEMP UNLOGGED TABLE country_codes (alpha2 text, alpha3 text, name text, region text) ON COMMIT DROP
COPY country_codes FROM 'countriesregions.csv' WITH (FORMAT csv);

UPDATE admin_region
SET "isoA2" = country_codes.alpha2
FROM country_codes
WHERE admin_region."isoA3" = country_codes.alpha3;

COMMIT;