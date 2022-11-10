import { MigrationInterface, QueryRunner } from 'typeorm';

export class SatteligenceIndicatorCalculations1668073310691
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sum_satelligence_deforestation_over_georegion(
    geo_region_id uuid
)
RETURNS float AS
$$
    DECLARE
        h3_table_name varchar := 'h3_grid_sat_deforestation';
        h3_column_name varchar := 'deforestation2021Ha' ;
        h3_resolution integer := 6;
        sum float;
    BEGIN
        -- Sum table column over region
        SELECT sum_h3_grid_over_georegion(geo_region_id, h3_resolution, h3_table_name, h3_column_name)
        INTO sum;
        RETURN sum;
    END;
$$
LANGUAGE plpgsql;
      `);

    await queryRunner.query(`CREATE OR REPLACE FUNCTION sum_satelligence_deforestation_risk_over_georegion(
    geo_region_id uuid
)
RETURNS float AS
$$
    DECLARE
        h3_table_name varchar := 'h3_grid_sat_deforestation_risk';
        h3_column_name varchar := 'deforestationRisk' ;
        h3_resolution integer := 6;
        sum float;
    BEGIN
        -- Sum table column over region
        SELECT sum_h3_grid_over_georegion(geo_region_id, h3_resolution, h3_table_name, h3_column_name)
        INTO sum;
        RETURN sum;
    END;
$$
LANGUAGE plpgsql;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS sum_satelligence_deforestation_over_georegion()`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS sum_satelligence_deforestation_risk_over_georegion()`,
    );
  }
}
