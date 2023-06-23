import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDatasetColumnNamesForStoredProcedures1687505698725
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE OR REPLACE FUNCTION sum_weighted_deforestation_over_georegion(\n' +
        '    geo_region_id uuid,\n' +
        '    material_id uuid,\n' +
        '    h3_data_type material_to_h3_type_enum\n' +
        ')\n' +
        'RETURNS float AS\n' +
        '$$\n' +
        '    DECLARE\n' +
        '        material_h3_table_name varchar;\n' +
        '        material_h3_column_name varchar;\n' +
        '        h3_resolution integer;\n' +
        "        deforestation_h3_table_name varchar := 'h3_grid_deforestation_global'; --update with new deforestation table\n" +
        "        deforestation_h3_column_name varchar := 'hansenLossBuffered2021';\n" +
        '        sum float;\n' +
        '    BEGIN\n' +
        '        -- Get h3data table name and column name for given material\n' +
        '        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution\n' +
        '        FROM get_h3_table_column_for_material(material_id, h3_data_type);\n' +
        '        -- Sum table column over region\n' +
        '        EXECUTE format(\n' +
        "            'SELECT sum(h3grid_mat.%I * h3grid_def.%I)\n" +
        '                FROM\n' +
        '                    get_h3_uncompact_geo_region($1, $2) geo_region\n' +
        '                    INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index\n' +
        '                    INNER JOIN %I h3grid_def ON h3grid_def.h3index = geo_region.h3index;\n' +
        "            ', material_h3_column_name, deforestation_h3_column_name, material_h3_table_name, deforestation_h3_table_name)\n" +
        '            USING geo_region_id, h3_resolution\n' +
        '            INTO sum;\n' +
        '        RETURN sum;\n' +
        '    END;\n' +
        '$$\n' +
        'LANGUAGE plpgsql;',
    );
    await queryRunner.query(
      'CREATE OR REPLACE FUNCTION sum_weighted_carbon_over_georegion(\n' +
        '    geo_region_id uuid,\n' +
        '    material_id uuid,\n' +
        '    h3_data_type material_to_h3_type_enum\n' +
        ')\n' +
        'RETURNS float AS\n' +
        '$$\n' +
        '    DECLARE\n' +
        '        material_h3_table_name varchar;\n' +
        '        material_h3_column_name varchar;\n' +
        '        h3_resolution integer;\n' +
        "        carbon_h3_table_name varchar := 'h3_grid_ghg_global';\n" +
        "        carbon_h3_column_name varchar := 'forestGhgBuffered2021';\n" +
        '        sum float;\n' +
        '    BEGIN\n' +
        '        -- Get h3data table name and column name for given material --\n' +
        '        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution\n' +
        '        FROM get_h3_table_column_for_material(material_id, h3_data_type);\n' +
        '        -- Sum deforestation times carbon where material is produced --\n' +
        '        EXECUTE format(\n' +
        "                'SELECT sum(h3grid_mat.%I * h3grid_carbon.%I) --carbon has been already multiplied by the deforestation\n" +
        '                    FROM get_h3_uncompact_geo_region($1, $2) geo_region\n' +
        '                        INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index\n' +
        "                        INNER JOIN %I h3grid_carbon ON h3grid_carbon.h3index = geo_region.h3index;',\n" +
        '                material_h3_column_name,\n' +
        '                carbon_h3_column_name,\n' +
        '                material_h3_table_name,\n' +
        '                carbon_h3_table_name\n' +
        '            )\n' +
        '            USING geo_region_id, h3_resolution\n' +
        '            INTO sum;\n' +
        '        RETURN sum;\n' +
        '    END;\n' +
        '$$\n' +
        'LANGUAGE plpgsql;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE OR REPLACE FUNCTION sum_weighted_deforestation_over_georegion(\n' +
        '    geo_region_id uuid,\n' +
        '    material_id uuid,\n' +
        '    h3_data_type material_to_h3_type_enum\n' +
        ')\n' +
        'RETURNS float AS\n' +
        '$$\n' +
        '    DECLARE\n' +
        '        material_h3_table_name varchar;\n' +
        '        material_h3_column_name varchar;\n' +
        '        h3_resolution integer;\n' +
        "        deforestation_h3_table_name varchar := 'h3_grid_deforestation_global'; --update with new deforestation table\n" +
        "        deforestation_h3_column_name varchar := 'hansenLoss2020HaBuffered';\n" +
        '        sum float;\n' +
        '    BEGIN\n' +
        '        -- Get h3data table name and column name for given material\n' +
        '        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution\n' +
        '        FROM get_h3_table_column_for_material(material_id, h3_data_type);\n' +
        '        -- Sum table column over region\n' +
        '        EXECUTE format(\n' +
        "            'SELECT sum(h3grid_mat.%I * h3grid_def.%I)\n" +
        '                FROM\n' +
        '                    get_h3_uncompact_geo_region($1, $2) geo_region\n' +
        '                    INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index\n' +
        '                    INNER JOIN %I h3grid_def ON h3grid_def.h3index = geo_region.h3index;\n' +
        "            ', material_h3_column_name, deforestation_h3_column_name, material_h3_table_name, deforestation_h3_table_name)\n" +
        '            USING geo_region_id, h3_resolution\n' +
        '            INTO sum;\n' +
        '        RETURN sum;\n' +
        '    END;\n' +
        '$$\n' +
        'LANGUAGE plpgsql;',
    );

    await queryRunner.query(
      'CREATE OR REPLACE FUNCTION sum_weighted_carbon_over_georegion(\n' +
        '    geo_region_id uuid,\n' +
        '    material_id uuid,\n' +
        '    h3_data_type material_to_h3_type_enum\n' +
        ')\n' +
        'RETURNS float AS\n' +
        '$$\n' +
        '    DECLARE\n' +
        '        material_h3_table_name varchar;\n' +
        '        material_h3_column_name varchar;\n' +
        '        h3_resolution integer;\n' +
        "        carbon_h3_table_name varchar := 'h3_grid_ghg_global';\n" +
        "        carbon_h3_column_name varchar := 'forestGhg2020Buffered';\n" +
        '        sum float;\n' +
        '    BEGIN\n' +
        '        -- Get h3data table name and column name for given material --\n' +
        '        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution\n' +
        '        FROM get_h3_table_column_for_material(material_id, h3_data_type);\n' +
        '        -- Sum deforestation times carbon where material is produced --\n' +
        '        EXECUTE format(\n' +
        "                'SELECT sum(h3grid_mat.%I * h3grid_carbon.%I) --carbon has been already multiplied by the deforestation\n" +
        '                    FROM get_h3_uncompact_geo_region($1, $2) geo_region\n' +
        '                        INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index\n' +
        "                        INNER JOIN %I h3grid_carbon ON h3grid_carbon.h3index = geo_region.h3index;',\n" +
        '                material_h3_column_name,\n' +
        '                carbon_h3_column_name,\n' +
        '                material_h3_table_name,\n' +
        '                carbon_h3_table_name\n' +
        '            )\n' +
        '            USING geo_region_id, h3_resolution\n' +
        '            INTO sum;\n' +
        '        RETURN sum;\n' +
        '    END;\n' +
        '$$',
    );
  }
}
