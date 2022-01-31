--
CREATE EXTENSION IF NOT EXISTS ltree;

-- 1. Upsert from gadm to geo_region converting geometry to H3
TRUNCATE TABLE geo_region CASCADE;

INSERT INTO geo_region
("name", "h3Flat", "h3Compact", "theGeom", "isCreatedByUser")

SELECT
mpath,
array(
    SELECT h3_polyfill(wkb_geometry, 6)
) AS "h3Flat",
array(
    SELECT h3_compact(array(
        SELECT h3_polyfill(wkb_geometry, 6)
    ))
) AS "h3Compact",
wkb_geometry,
false
FROM gadm_levels0_2
ON CONFLICT (name) DO UPDATE SET
"h3Compact" = EXCLUDED."h3Compact",
"theGeom" = EXCLUDED."theGeom";

UPDATE geo_region set "h3FlatLength" = cardinality("h3Flat");

-- 2. Insert into admin_region referencing geo_region
BEGIN;

TRUNCATE TABLE admin_region CASCADE;

-- 2.1 Create the records
INSERT INTO admin_region
    ("name", "level", "gadmId", "geoRegionId", "isoA3")
SELECT
    gadm_levels0_2.name,
    gadm_levels0_2.level,
    gadm_levels0_2.mpath,
    geo_region.id,
    CASE
        WHEN gadm_levels0_2.GID_0 = gadm_levels0_2.mpath THEN gadm_levels0_2.GID_0
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
WHERE subpath(child."gadmId"::ltree, 0, -1)::text = replace(parent."gadmId", '_1', '');
-- for some reason GADM has "_1" appended to the end of some IDs

-- 2.3 Create the id-based materialized path as `parent.mpath`.`child.id` from
-- the tree as this is usually created by TypeORM
WITH RECURSIVE q(id, mpath) AS (
    SELECT id, id::text as mpath
    FROM admin_region
    WHERE "parentId" is null
    UNION ALL
    SELECT child.id, CONCAT(q.mpath, '.', child.id) as mpath
    FROM q, admin_region child
    WHERE child."parentId" = q.id
)
UPDATE admin_region
SET mpath = q.mpath
FROM q
WHERE admin_region.id = q.id;

COMMIT;

-- 3. add alpha2 code
BEGIN;

CREATE TEMP TABLE tmp_countries
(alpha2 varchar, alpha3 varchar, name varchar, region varchar)
ON COMMIT DROP;

\copy tmp_countries FROM 'countriesregions.csv' WITH (FORMAT csv);

UPDATE admin_region
SET "isoA2" = tmp_countries.alpha2
FROM tmp_countries
WHERE admin_region."isoA3" = tmp_countries.alpha3;

COMMIT;
