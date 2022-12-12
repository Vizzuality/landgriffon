import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * @description: Corrects pointing to SUM of all harvested materials pre-computed during seed ingestion
 *               In the future, we could probably map this as an Entity, or at least a known record in H3Data
 *               to avoid this critical data being a magic string somewhere in the code
 */

export class PointerToAllHarvestSumColumn1667976597890
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION sum_h3_weighted_cropland_area(
    geo_region_id uuid,
    material_id uuid,
    h3_data_type material_to_h3_type_enum
)
RETURNS float AS
$$
    DECLARE
        material_h3_table_name varchar;
        material_h3_column_name varchar;
        h3_resolution integer;
        agri_ha_h3_table_name varchar := 'h3_grid_spam2010v2r0_global_ha';
        agri_ha_h3_column_name varchar := 'spam2010V2R0GlobalHAllA';
        sum float;
    BEGIN
        --Get h3data table name and column for a given material
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);


        -- Sum table column over region
        EXECUTE format(
            'SELECT sum(h3grid_mat.%I * h3grid_all_ha.%I)
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                    INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index
                    INNER JOIN %I h3grid_all_ha ON h3grid_all_ha.h3index = geo_region.h3index
                ', material_h3_column_name, agri_ha_h3_column_name,material_h3_table_name, agri_ha_h3_table_name)
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
$$
LANGUAGE plpgsql;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS sum_h3_weighted_cropland_area();`,
    );
  }
}
