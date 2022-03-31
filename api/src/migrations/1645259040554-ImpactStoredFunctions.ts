import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImpactStoredFunctions1645259040554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_h3_uncompact_geo_region(geo_region_id uuid, h3_resolution int)
      RETURNS TABLE (h3index h3index) AS
      $$
      SELECT h3_uncompact(geo_region."h3Compact"::h3index[], h3_resolution) h3index
      FROM geo_region WHERE geo_region.id = geo_region_id
      $$
      LANGUAGE SQL;
      ---
      CREATE OR REPLACE FUNCTION sum_h3_grid_over_georegion(
        geo_region_id uuid,
        h3_resolution int,
        h3_table_name varchar,
        h3_column_name varchar
      )
      RETURNS float AS
      $$
        DECLARE
          sum float;
        BEGIN
          EXECUTE format(
            'SELECT sum(h3grid.%I)
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                    INNER JOIN %I h3grid ON h3grid.h3index = geo_region.h3index;
            ', h3_column_name, h3_table_name)
            USING geo_region_id, h3_resolution
            INTO sum;
          RETURN sum;
        END;
      $$
      LANGUAGE plpgsql`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION sumprod_h3_grids_over_georegion(
        geo_region_id uuid,
        h3_resolution int,
        h3_table_name_1 varchar,
        h3_column_name_1 varchar,
        h3_table_name_2 varchar,
        h3_column_name_2 varchar
      )
      RETURNS float AS
      $$
        DECLARE
          sumprod float;
        BEGIN
          EXECUTE format(
            'SELECT sum(h3grid_1.%I * h3grid_2.%I)
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                    INNER JOIN %I h3grid_1 ON h3grid_1.h3index = geo_region.h3index
                    INNER JOIN %I h3grid_2 ON h3grid_2.h3index = geo_region.h3index;
            ', h3_column_name_1, h3_column_name_2, h3_table_name_1, h3_table_name_2)
            USING geo_region_id, h3_resolution
            INTO sumprod;
          RETURN sumprod;
        END;
      $$
      LANGUAGE plpgsql;`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_h3_table_column_for_material(material_id uuid, h3_data_type material_to_h3_type_enum)
      RETURNS TABLE (h3_table_name varchar, h3_column_name varchar, h3_resolution int) AS
      $$
        SELECT h3_data."h3tableName", h3_data."h3columnName", h3_data."h3resolution"
        FROM h3_data
        INNER JOIN material_to_h3 ON material_to_h3."h3DataId" = h3_data.id
        WHERE material_to_h3."materialId" = material_id
        AND material_to_h3.type = h3_data_type
        LIMIT 1;
      $$
      LANGUAGE SQL;`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sum_material_over_georegion(
        geo_region_id uuid,
        material_id uuid,
        h3_data_type material_to_h3_type_enum
      )
      RETURNS float AS
      $$
        DECLARE
          h3_table_name varchar;
          h3_column_name varchar;
          h3_resolution integer;
          sum float;

        BEGIN
          -- Get h3data table name and column name for given material
          SELECT * INTO h3_table_name, h3_column_name, h3_resolution
          FROM get_h3_table_column_for_material(material_id, h3_data_type);

          -- Sum table column over region
          SELECT sum_h3_grid_over_georegion(geo_region_id, h3_resolution, h3_table_name, h3_column_name)
          INTO sum;
          RETURN sum;
        END;
      $$
      LANGUAGE plpgsql;`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sum_weighted_deforestation_over_georegion(
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
        deforestation_h3_table_name varchar := 'h3_grid_deforestation_global';
        deforestation_h3_column_name varchar := 'hansenLoss2019';
        sum float;

      BEGIN
        -- Get h3data table name and column name for given material
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Sum table column over region
        EXECUTE format(
            'SELECT sum(h3grid_mat.%I * h3grid_def.%I)
                FROM
                    get_h3_uncompact_geo_region($1, $2) geo_region
                    INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index
                    INNER JOIN %I h3grid_def ON h3grid_def.h3index = geo_region.h3index;
            ', material_h3_column_name, deforestation_h3_column_name, material_h3_table_name, deforestation_h3_table_name)
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
      END;
    $$
    LANGUAGE plpgsql;
      `);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION sum_weighted_biodiversity_over_georegion(
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
        deforestation_h3_table_name varchar := 'h3_grid_deforestation_global';
        deforestation_h3_column_name varchar := 'hansenLoss2019';
        bio_h3_table_name varchar := 'h3_grid_bio_global';
        bio_h3_column_name varchar := 'lciaPslRPermanentCrops';
        sum float;

      BEGIN
        -- Get h3data table name and column name for given material --
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Sum deforestation times biodiversity where material is produced --
        EXECUTE format(
                'SELECT sum(h3grid_mat.%I * h3grid_def.%I * h3grid_bio.%I * (1/0.0001))
                    FROM get_h3_uncompact_geo_region($1, $2) geo_region
                        INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index
                        INNER JOIN %I h3grid_def ON h3grid_def.h3index = geo_region.h3index
                        INNER JOIN %I h3grid_bio ON h3grid_bio.h3index = geo_region.h3index;',
                material_h3_column_name,
                deforestation_h3_column_name,
                bio_h3_column_name,
                material_h3_table_name,
                deforestation_h3_table_name,
                bio_h3_table_name
            )
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
      END;
    $$
    LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
     CREATE OR REPLACE FUNCTION sum_weighted_carbon_over_georegion(
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
        deforestation_h3_table_name varchar := 'h3_grid_deforestation_global';
        deforestation_h3_column_name varchar := 'hansenLoss2019';
        carbon_h3_table_name varchar := 'h3_grid_carbon_global';
        carbon_h3_column_name varchar := 'earthstat2000GlobalHectareEmissions';
        sum float;

    BEGIN
        -- Get h3data table name and column name for given material --
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Sum deforestation times carbon where material is produced --
        EXECUTE format(
                'SELECT sum(h3grid_mat.%I * h3grid_def.%I * h3grid_carbon.%I)
                    FROM get_h3_uncompact_geo_region($1, $2) geo_region
                        INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index
                        INNER JOIN %I h3grid_def ON h3grid_def.h3index = geo_region.h3index
                        INNER JOIN %I h3grid_carbon ON h3grid_carbon.h3index = geo_region.h3index;',
                material_h3_column_name,
                deforestation_h3_column_name,
                carbon_h3_column_name,
                material_h3_table_name,
                deforestation_h3_table_name,
                carbon_h3_table_name
            )
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
  $$
  LANGUAGE plpgsql;
    `);

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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP FUNCTION IF EXISTS get_h3_uncompact_geo_region();

    DROP FUNCTION IF EXISTS sum_h3_grid_over_georegion();

    DROP FUNCTION IF EXISTS sumprod_h3_grids_over_georegion();

    DROP FUNCTION IF EXISTS get_h3_table_column_for_material();

    DROP FUNCTION IF EXISTS sum_weighted_deforestation_over_georegion();

    DROP FUNCTION IF EXISTS sum_weighted_biodiversity_over_georegion();

    DROP FUNCTION IF EXISTS sum_weighted_carbon_over_georegion();

    DROP FUNCTION IF EXISTS sum_material_over_georegion();
    `);
  }
}
