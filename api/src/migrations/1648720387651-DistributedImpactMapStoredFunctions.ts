import { MigrationInterface, QueryRunner } from 'typeorm';

export class DistributedImpactMapStoredFunctions1648720387651
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_h3_material_table_column(h3DataId uuid)
    RETURNS TABLE (h3_table_name varchar, h3_column_name varchar) AS
    $$
        SELECT h3_data."h3tableName", h3_data."h3columnName"
        FROM h3_data
        WHERE h3_data.id = h3DataId 
        LIMIT 1;
    $$
    LANGUAGE SQL;
    `);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_h3_data_over_georegion(
    geo_region_id uuid, 
    h3DataId uuid
    )
    RETURNS TABLE (h3index h3index, value float) AS
    $$
        DECLARE
            material_h3_table_name varchar;
            material_h3_column_name varchar;
            h3_resolution integer := 6;
            value float;

        BEGIN
            -- Get h3data table name and column name for given material
            SELECT * INTO material_h3_table_name, material_h3_column_name
            FROM get_h3_material_table_column(h3DataId);

            -- Sum table column over region
            RETURN QUERY EXECUTE format(
                'SELECT 
                    h3grid.h3index,
                    h3grid.%I::float
                    FROM
                        get_h3_uncompact_geo_region($1, $2) geo_region
                        INNER JOIN %I h3grid ON h3grid.h3index = geo_region.h3index
                WHERE h3grid.%I > 0
                ', material_h3_column_name, material_h3_table_name, material_h3_column_name)
                USING geo_region_id, h3_resolution;
        END;
    $$
    LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP FUNCTION IF EXISTS get_h3_material_table_column();

    DROP FUNCTION IF EXISTS get_h3_data_over_georegion();

    `);
  }
}
