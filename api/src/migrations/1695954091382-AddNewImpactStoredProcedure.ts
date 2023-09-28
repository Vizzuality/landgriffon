import {
  get_annual_commodity_weighted_impact_over_georegion,
  get_h3_table_column_for_indicators_by_name_code,
  get_indicator_coefficient_impact,
} from 'procedures/stored-prodecures';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewImpactStoredProcedure1695954091382
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

    CREATE OR REPLACE FUNCTION ${get_annual_commodity_weighted_impact_over_georegion}(
      geo_region_id uuid,
      shortName text,
      material_id uuid,
      h3_data_type material_to_h3_type_enum
     )
     RETURNS float AS
     $$
     DECLARE
        h3_resolution integer;
        indicator_h3_table_name varchar;
        indicator_h3_column_name varchar;
        h3_indicator_resolution varchar;
        material_h3_table_name varchar;
        material_h3_column_name varchar;
        sum float;
    BEGIN


        SELECT * INTO indicator_h3_table_name, indicator_h3_column_name, h3_indicator_resolution
        FROM ${get_h3_table_column_for_indicators_by_name_code}(shortName);

        -- Get h3data table name, column and resolution for the material production
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Sum commodity weighted impact values
        EXECUTE format(
            'SELECT sum(h3ind.%I * h3prod.%I )
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index
                INNER JOIN %I h3prod ON h3ind.h3index = h3prod.h3index;
            ', indicator_h3_column_name,
            material_h3_column_name,
            indicator_h3_table_name,
            material_h3_table_name)
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
$$
LANGUAGE plpgsql;
      `);

    await queryRunner.query(`
    DROP FUNCTION ${get_indicator_coefficient_impact};

    CREATE OR REPLACE FUNCTION ${get_indicator_coefficient_impact}(
    name_code text,
    admin_region_id uuid,
    material_id uuid)
    RETURNS float AS
    $$
      DECLARE
        indicator_id uuid;
        value float;
    BEGIN

        --get indicatorId
        SELECT "id" INTO indicator_id FROM "indicator"
        WHERE "nameCode" = name_code;

        -- get water footprint value by location, material and indicator
        EXECUTE format(
            'SELECT
                COALESCE (
                    (
                    SELECT ic."value"
                    FROM "indicator_coefficient" ic
                    WHERE ic."adminRegionId" = $1
                    AND ic."materialId" = $2
                    AND ic."indicatorId" = $3
                    AND ic."value" IS NOT NULL
                    ),
                    (
                    SELECT ic."value"
                    FROM "indicator_coefficient" ic
                    WHERE ic."adminRegionId" IS NULL
                    AND ic."materialId" = $2
                    AND ic."indicatorId" = $3
                    AND ic."value" IS NOT NULL
                    )
                ) AS value;'
                )
            USING admin_region_id, material_id, indicator_id
            INTO value;
        RETURN value;
    END;
$$
LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_h3_table_column_for_material_indicators(nameCode text,
materialId uuid)
RETURNS TABLE (h3_table_name varchar, h3_column_name varchar, h3_resolution int) AS
$$
    SELECT h3_data."h3tableName", h3_data."h3columnName", h3_data."h3resolution"
    FROM h3_data
        INNER JOIN "material_indicator_to_h3" mith ON mith."h3DataId" = h3_data."id"
        INNER JOIN "indicator" i ON i."id" = mith."indicatorId"
    WHERE i."nameCode" = nameCode
    AND mith."materialId" = materialId
    LIMIT 1;
$$
LANGUAGE SQL;
    `);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_annual_commodity_weighted_material_impact_over_georegion(
    geo_region_id uuid,
    nameCode text,
    material_id uuid,
    h3_data_type material_to_h3_type_enum
)
RETURNS float AS
$$
    DECLARE
        h3_resolution integer;
        indicator_h3_table_name varchar;
        indicator_h3_column_name varchar;
        h3_indicator_resolution varchar;
        material_h3_table_name varchar;
        material_h3_column_name varchar;
        sum float;
    BEGIN

        -- Get h3data table name, column for material indicator
        SELECT * INTO indicator_h3_table_name, indicator_h3_column_name, h3_indicator_resolution
        FROM get_h3_table_column_for_material_indicators(nameCode, material_id);

        -- Get h3data table name, column and resolution for the material production
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Sum commodity weighted impact values
        EXECUTE format(
            'SELECT sum(h3ind.%I * h3prod.%I )
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index
                INNER JOIN %I h3prod ON h3ind.h3index = h3prod.h3index;
            ', indicator_h3_column_name,
            material_h3_column_name,
            indicator_h3_table_name,
            material_h3_table_name)
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
$$
LANGUAGE plpgsql


    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
