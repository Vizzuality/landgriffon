import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixWGSWU_NEWProcedures1742722161569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the function to compute the BWS in stressed areas
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_bws_in_stressed_areas(
    geo_region_id uuid,
    nameCode text,
    material_id uuid,
    h3_data_type material_to_h3_type_enum)
RETURNS double precision AS
$$
    DECLARE
        aqueduct_h3_table_name varchar;
        aqueduct_h3_column_name varchar;
        h3_indicator_resolution integer;
        material_h3_table_name varchar;
        material_h3_column_name varchar;
        h3_resolution integer;
        bws double precision;

    BEGIN

        -- Get h3data table name, column and resolution for the material production
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Get h3data table name, column
        SELECT * INTO aqueduct_h3_table_name, aqueduct_h3_column_name, h3_indicator_resolution
        FROM get_h3_table_column_for_indicators_by_name_code(nameCode);

        -- Execute the BWS in stressed areas
        EXECUTE format(
            'SELECT sum(h3ind.%I * h3prod.%I) /sum(h3prod.%I)
            FROM
                get_h3_uncompact_geo_region($1, $2) geo_region
            INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index
            INNER JOIN %I h3prod ON h3ind.h3index = h3prod.h3index
            WHERE (h3ind.%I > 0.4 AND h3ind.%I < 9999);',
            aqueduct_h3_column_name,
            material_h3_column_name,
            material_h3_column_name,
            aqueduct_h3_table_name,
            material_h3_table_name,
            aqueduct_h3_column_name,
            aqueduct_h3_column_name
            )
            INTO bws
            USING geo_region_id, h3_resolution;

        RETURN bws;
    END;
$$ LANGUAGE plpgsql;
    `);

    // Add the function to compute the stressed area portion
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_stressed_area_portion(
    geo_region_id uuid,
    nameCode text,
    material_id uuid,
    h3_data_type material_to_h3_type_enum)
RETURNS double precision AS
$$
    DECLARE
        aqueduct_h3_table_name varchar;
        aqueduct_h3_column_name varchar;
        h3_indicator_resolution integer;
        material_h3_table_name varchar;
        material_h3_column_name varchar;
        h3_resolution integer;
        percentage double precision;
    BEGIN

        -- Get h3data table name, column and resolution for the material production
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Get h3data table name, column
        SELECT * INTO aqueduct_h3_table_name, aqueduct_h3_column_name, h3_indicator_resolution
        FROM get_h3_table_column_for_indicators_by_name_code(nameCode);

        -- Execute the weighted average BWS query
        EXECUTE format(
            'SELECT sum(CASE WHEN h3ind.%I > 0.4 AND h3ind.%I< 9999 THEN h3prod.%I ELSE 0 END)/
                    sum(h3prod.%I)
            FROM
                get_h3_uncompact_geo_region($1, $2) geo_region
            INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index
            INNER JOIN %I h3prod ON h3ind.h3index = h3prod.h3index;',
            aqueduct_h3_column_name,
            aqueduct_h3_column_name,
            material_h3_column_name,
            material_h3_column_name,
            aqueduct_h3_table_name,
            material_h3_table_name
            )
            INTO percentage
            USING geo_region_id, h3_resolution;

        RETURN percentage;
    END;
$$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP FUNCTION IF EXISTS get_bws_in_stressed_areas(geo_region_id uuid, nameCode text, material_id uuid, h3_data_type material_to_h3_type_enum);
    `);
    await queryRunner.query(`
    DROP FUNCTION IF EXISTS get_stressed_area_portion(geo_region_id uuid, nameCode text, material_id uuid, h3_data_type material_to_h3_type_enum);
    `);
  }
}
