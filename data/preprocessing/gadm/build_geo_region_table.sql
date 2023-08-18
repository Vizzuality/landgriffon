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
