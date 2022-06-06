import { MigrationInterface, QueryRunner } from 'typeorm';

export class WaterIndicatorColumnNameUpdate1654502331040
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sum_weighted_water_over_georegion(
    geo_region_id uuid
   )
  RETURNS float AS
  $$
    DECLARE
        water_h3_table_name varchar := 'h3_grid_wf_global';
        water_h3_column_name varchar := 'wfBltotMmyrT';
        h3_resolution integer := 6;
        sum float;

    BEGIN

        -- Sum deforestation times carbon where material is produced --
        EXECUTE format(
                'SELECT sum(h3grid_water.%I * 0.001)
                    FROM get_h3_uncompact_geo_region($1, $2) geo_region
                        INNER JOIN %I h3grid_water ON h3grid_water.h3index = geo_region.h3index;',
                water_h3_column_name,
                water_h3_table_name
            )
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
  $$
  LANGUAGE plpgsql;

      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION sum_weighted_water_over_georegion(
    geo_region_id uuid
   )
  RETURNS float AS
  $$
    DECLARE
        water_h3_table_name varchar := 'h3_grid_wf_global';
        water_h3_column_name varchar := 'wfBltotMmyr';
        h3_resolution integer := 6;
        sum float;

    BEGIN

        -- Sum deforestation times carbon where material is produced --
        EXECUTE format(
                'SELECT sum(h3grid_water.%I * 0.001)
                    FROM get_h3_uncompact_geo_region($1, $2) geo_region
                        INNER JOIN %I h3grid_water ON h3grid_water.h3index = geo_region.h3index;',
                water_h3_column_name,
                water_h3_table_name
            )
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
  $$
  LANGUAGE plpgsql;
    `);
  }
}
