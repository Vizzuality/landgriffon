import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateImpactStoredFunctions1692854789441
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * @description: This function is used to get the h3 table name and column name for a given indicator by its name code
     */
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_h3_table_column_for_indicators_by_name_code(name_code text)
        RETURNS TABLE (h3_table_name varchar, h3_column_name varchar, h3_resolution int) AS
        $$
        SELECT h3_data."h3tableName", h3_data."h3columnName", h3_data."h3resolution"
        FROM h3_data
          INNER JOIN "indicator" ind ON ind."id" = h3_data."indicatorId"
          WHERE ind."nameCode" = name_code
        $$
      LANGUAGE SQL;`);

    /**
     * @description: Calculates Impact for deforestation, climate risk, carbon and natural conversion
     *
     * @notes: ##NOTE: Assuming that deforestation-ghg emissions/human land use has been preprocessed and stored in the ddbb
     * ## UPDATED DEFORESTATION, CLIMATE RISK FORMULAS/CARBON, NATURAL CONVERSION:
     */

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_annual_landscape_impact_over_georegion(
      geo_region_id uuid,
      name_code text,
      material_id uuid,
      h3_material_type material_to_h3_type_enum
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

        -- Get h3data table name, column for indicator given name_code
        SELECT * INTO indicator_h3_table_name, indicator_h3_column_name, h3_indicator_resolution
        FROM get_h3_table_column_for_indicators_by_name_code(name_code);

        -- Get h3data table name, column and resolution for the material, given the material id and h3_
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_material_type);

        -- Sum landscape impact values
        EXECUTE format(
            'SELECT sum(h3ind.%I * h3prod.%I )
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index
                INNER JOIN %I h3prod ON h3ind.h3index = h3prod.h3index;
            ', indicator_h3_column_name, material_h3_column_name, indicator_h3_table_name, material_h3_table_name)
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
      END;
      $$
      LANGUAGE plpgsql;
     `);
    /**
     * @description: Calculates Impact for new indicators added as part of this change
     *
     * @notes: ## NEW INDICATORS:
     *
     * ## Water quality - use the same function as the blue water footprint
     * #I have slightly modified the formula to make it dependent on the indicator table
     */

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_indicator_coefficient_impact(
        name_code text,
        adminRegionId uuid,
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
                    SELECT ic."value" /1000 --convert the m3 to Mm3
                    FROM "indicator_coefficient" ic
                    WHERE ic."adminRegionId" = $1
                    AND ic."materialId" = $2
                    AND ic."indicatorId" = $3
                    AND ic."value" IS NOT NULL
                    ),
                    (
                    SELECT ic."value" /1000 --convert the m3 to Mm3
                    FROM "indicator_coefficient" ic
                    WHERE ic."adminRegionId" IS NULL
                    AND ic."materialId" = $2
                    AND ic."indicatorId" = $3
                    AND ic."value" IS NOT NULL
                    )
                ) AS value;'
                )
            USING adminRegionId, material_id, indicator_id
            INTO value;
        RETURN value;
    END;
    $$
    LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
    DROP FUNCTION IF EXISTS get_percentage_water_stress_area;

    CREATE OR REPLACE FUNCTION get_percentage_water_stress_area(
    geo_region_id uuid,
    nameCode text
)
RETURNS double precision
AS
$$
DECLARE
    aqueduct_h3_table_name varchar;
    aqueduct_h3_column_name varchar;
    h3_resolution integer;
    percentage double precision;

BEGIN
    -- Get h3data table name, column
    SELECT * INTO aqueduct_h3_table_name, aqueduct_h3_column_name, h3_resolution
    FROM get_h3_table_column_for_indicators_by_name_code(nameCode);

    EXECUTE format(
        'SELECT
            ROUND(
            CAST(reduced.ws_area AS NUMERIC) /
            CAST(reduced.g_area AS NUMERIC),
            2
            ) AS percentage
        FROM
            (SELECT
                sum(case when aqueduct.%I > 3 then 1 else 0 end) ws_area,
                count(aqueduct.%I) g_area
            FROM get_h3_uncompact_geo_region($1, $2) geo_region
            INNER JOIN %I aqueduct ON aqueduct.h3index = geo_region.h3index) reduced
        WHERE reduced.g_area > 0;',
        aqueduct_h3_column_name,
        aqueduct_h3_column_name,
        aqueduct_h3_table_name
    )
    USING geo_region_id, h3_resolution
    INTO percentage;

    RETURN percentage;
END;
$$
LANGUAGE plpgsql;`);

    await queryRunner.query(`DROP FUNCTION IF EXISTS sum_h3_cropland_area`);

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS sum_weighted_deforestation_over_georegion`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS sum_weighted_carbon_over_georegion`,
    );

    await queryRunner.query(`DROP FUNCTION IF EXISTS get_blfw_impact`);
  }

  /**
   * @description: Remove procedures that are no longer needed
   */

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_annual_landscape_impact_over_georegion`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_indicator_coefficient_impact`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_h3_table_column_for_indicators_by_name_code`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_percentage_water_stress_area`,
    );
  }
}
