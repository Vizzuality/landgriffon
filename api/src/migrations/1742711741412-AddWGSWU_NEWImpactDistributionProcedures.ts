import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWGSWUNEWImpactDistributionProcedures1742711741412
  implements MigrationInterface
{
  // Adds functions to compute unweighted impact distribution when production is 0 for WGSWU_NEW
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_bws_in_stressed_areas_unweighted(
    geo_region_id uuid,
    nameCode text)
RETURNS double precision AS
$$
    DECLARE
        aqueduct_h3_table_name varchar;
        aqueduct_h3_column_name varchar;
        h3_indicator_resolution integer;
        bws double precision;

    BEGIN

        -- Get h3data table name, column
        SELECT * INTO aqueduct_h3_table_name, aqueduct_h3_column_name, h3_indicator_resolution
        FROM get_h3_table_column_for_indicators_by_name_code(nameCode);

        -- Execute the average BWS in stressed areas
        EXECUTE format(
            'SELECT sum(h3ind.%I)/count(*)
            FROM
                get_h3_uncompact_geo_region($1, $2) geo_region
            INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index
            WHERE (h3ind.%I > 0.4 AND h3ind.%I < 9999);',
            aqueduct_h3_column_name,
            aqueduct_h3_table_name,
            aqueduct_h3_column_name,
            aqueduct_h3_column_name
            )
            INTO bws
            USING geo_region_id, h3_indicator_resolution;

        RETURN bws;
    END;
$$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`

CREATE OR REPLACE FUNCTION get_stressed_area_portion_unweighted(
    geo_region_id uuid,
    nameCode text)
RETURNS double precision AS
$$
    DECLARE
        aqueduct_h3_table_name varchar;
        aqueduct_h3_column_name varchar;
        h3_indicator_resolution integer;
        percentage double precision;
    BEGIN

        -- Get h3data table name, column
        SELECT * INTO aqueduct_h3_table_name, aqueduct_h3_column_name, h3_indicator_resolution
        FROM get_h3_table_column_for_indicators_by_name_code(nameCode);

        -- Execute the stress area portion query
        EXECUTE format(
            'SELECT sum(CASE WHEN h3ind.%I > 0.4 AND h3ind.%I < 9999 THEN 1 ELSE 0 END)::float/count(*)::float
            FROM
                get_h3_uncompact_geo_region($1, $2) geo_region
            INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index;',
            aqueduct_h3_column_name,
            aqueduct_h3_column_name,
            aqueduct_h3_table_name
            )
            INTO percentage
            USING geo_region_id, h3_indicator_resolution;

        RETURN percentage;
    END;
$$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS get_bws_in_stressed_areas_unweighted(
    geo_region_id uuid,
    nameCode text)`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS get_stressed_area_portion_unweighted(
    geo_region_id uuid,
    nameCode text)`);
  }
}
