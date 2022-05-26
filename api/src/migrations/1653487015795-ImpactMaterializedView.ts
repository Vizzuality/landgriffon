import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImpactMaterializedView1653487015795 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      CREATE MATERIALIZED VIEW impact_materialized_view AS
SELECT
    reduced."geoRegionId" as "geoRegionId",
    reduced."h3DataId" as "h3DataId",
    h3data."h3index" as "h3index",
    h3data.value as value
FROM (
    SELECT DISTINCT
        sl."geoRegionId" as "geoRegionId",
        ir."materialH3DataId" as "h3DataId"
    FROM sourcing_location sl
    LEFT JOIN sourcing_records sr ON sr."sourcingLocationId" = sl."id"
    LEFT JOIN indicator_record ir ON ir."sourcingRecordId" = sr."id"
    WHERE sl."scenarioInterventionId" IS NULL
) reduced,
LATERAL (
    SELECT
        h3index,
        value
    FROM get_h3_data_over_georegion(reduced."geoRegionId", reduced."h3DataId")
) h3data;

DROP INDEX IF EXISTS idx_georegion_h3data_indexed;
CREATE INDEX idx_georegion_h3data_indexed ON impact_materialized_view ("geoRegionId", "h3DataId", "h3index") INCLUDE ("value");


      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP MATERIALIZED VIEW IF EXISTS impact_materialized_view;`);
  }
}
