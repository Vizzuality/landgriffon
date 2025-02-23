import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUnweightedImpactOverGeoRegionProcedure1740209793910
  implements MigrationInterface
{
  /**
   * @description: Store procedure to distribute the impact of an indicator over each h3 index of a geo region
   *
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_annual_unweighted_impact_over_georegion(
    geo_region_id uuid,
    indicator_name_code text
     )
    RETURNS float AS
    $$
    DECLARE
      h3_resolution integer;
      indicator_h3_table_name varchar;
      indicator_h3_column_name varchar;
      sum float;
    BEGIN

      SELECT * INTO indicator_h3_table_name, indicator_h3_column_name, h3_resolution
      FROM get_h3_table_column_for_indicators_by_name_code(indicator_name_code);


      EXECUTE format(
          'SELECT sum(h3ind.%I) / count(*)
          FROM get_h3_uncompact_geo_region($1, $2) geo_region
          INNER JOIN %I h3ind ON h3ind.h3index = geo_region.h3index',
          indicator_h3_column_name,
          indicator_h3_table_name)
      USING geo_region_id, h3_resolution
      INTO sum;

      RETURN sum;
  END;
$$ LANGUAGE plpgsql;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP FUNCTION get_annual_unweighted_impact_over_georegion;
    `);
  }
}
