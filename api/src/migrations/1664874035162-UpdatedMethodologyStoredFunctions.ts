import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedMethodologyStoredFunctions1664874035162
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
        agri_ha_h3_column_name varchar := 'spam2010V2R0GlobalHAcofA'; --update with new column name;
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

    await queryRunner.query(`CREATE OR REPLACE FUNCTION sum_weighted_deforestation_over_georegion(
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
        deforestation_h3_table_name varchar := 'h3_grid_deforestation_global'; --update with new deforestation table
        deforestation_h3_column_name varchar := 'hansenLoss2020HaBuffered';
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
LANGUAGE plpgsql;`);

    await queryRunner.query(`CREATE OR REPLACE FUNCTION sum_weighted_carbon_over_georegion(
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
        carbon_h3_table_name varchar := 'h3_grid_ghg_global';
        carbon_h3_column_name varchar := 'forestGhg2020Buffered';
        sum float;

    BEGIN
        -- Get h3data table name and column name for given material --
        SELECT * INTO material_h3_table_name, material_h3_column_name, h3_resolution
        FROM get_h3_table_column_for_material(material_id, h3_data_type);

        -- Sum deforestation times carbon where material is produced --
        EXECUTE format(
                'SELECT sum(h3grid_mat.%I * h3grid_carbon.%I) --carbon has been already multiplied by the deforestation
                    FROM get_h3_uncompact_geo_region($1, $2) geo_region
                        INNER JOIN %I h3grid_mat ON h3grid_mat.h3index = geo_region.h3index
                        INNER JOIN %I h3grid_carbon ON h3grid_carbon.h3index = geo_region.h3index;',
                material_h3_column_name,
                carbon_h3_column_name,
                material_h3_table_name,
                carbon_h3_table_name
            )
            USING geo_region_id, h3_resolution
            INTO sum;
        RETURN sum;
    END;
$$
LANGUAGE plpgsql;`);

    await queryRunner.query(`CREATE OR REPLACE FUNCTION get_percentage_water_stress_area(
geo_region_id uuid
)
RETURNS float AS
$$
    DECLARE
        aqueduct_h3_table_name varchar := 'h3_grid_aqueduct_global';
        aqueduct_h3_column_name varchar := 'bwsCat';
        h3_resolution integer := 6;
        percentage float;

    BEGIN
        EXECUTE format(
            'SELECT reduced.ws_area/ reduced.g_area as percentage
            FROM
                (SELECT
                    sum(case when aqueduct.%I > 2 then 1 else 0 end)::float ws_area, count(aqueduct.%I)::float g_area
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

    await queryRunner.query(`CREATE OR REPLACE FUNCTION get_blwf_impact(
    adminRegionId uuid,
    material_id uuid)
RETURNS float AS
$$
    DECLARE
        indicator_coeficient_table varchar := 'indicator_coefficient';
        indicator_coeficient_value varchar := 'value';
        value float;
    BEGIN

        EXECUTE format(
            'SELECT reduced.%I
                FROM (
                    SELECT ind_coef.%I
                    FROM %I ind_coef
                    WHERE (ind_coef."adminRegionId" = $1 AND ind_coef."materialId" = $2)
                    OR (ind_coef."materialId" = $2 AND ind_coef."adminRegionId" IS NULL )
                    )reduced
                WHERE reduced.%I is not null;',
                indicator_coeficient_value,
                indicator_coeficient_value,
                indicator_coeficient_table,
                indicator_coeficient_value
                )
            USING adminRegionId, material_id
            INTO value;
        RETURN value;
    END;
$$
LANGUAGE plpgsql;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
