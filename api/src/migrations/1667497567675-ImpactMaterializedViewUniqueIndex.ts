import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImpactMaterializedViewUniqueIndex1667497567675
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_georegion_h3data_indexed;
        CREATE UNIQUE INDEX idx_georegion_h3data_indexed ON impact_materialized_view ("geoRegionId", "h3DataId", "h3index") INCLUDE ("value");
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS idx_georegion_h3data_indexed;
      `);
  }
}
