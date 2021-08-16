
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

INSERT INTO admin_region 
    ("name", "code", "geoRegionId", "isoA3")
SELECT 
    gadm_levels0_2.name, gadm_levels0_2.mpath, geo_region.id, gadm_levels0_2.GID_0
FROM geo_region
    LEFT JOIN gadm_levels0_2 ON geo_region.name = gadm_levels0_2.mpath
-- TypeORM doesn't make mpath unique for some reason?
-- so we use a WHERE clause instead of an ON CONFLICT
WHERE NOT EXISTS (SELECT 1 FROM admin_region a WHERE a.mpath = gadm_levels0_2.mpath);
ON CONFLICT (mpath) DO UPDATE SET
    "geoRegionId" = EXCLUDED."geoRegionId";

-- 3. Add parentIds since these are tracked separately from the path
UPDATE admin_region child
SET "parentId" = parent.id
FROM admin_region parent
WHERE child.mpath LIKE CONCAT(parent.mpath, '_%') AND child.mpath NOT LIKE CONCAT(parent.mpath, '_%._%')
COMMIT;