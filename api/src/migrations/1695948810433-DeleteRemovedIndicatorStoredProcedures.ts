import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteRemovedIndicatorStoredProcedures1695948810433
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS sum_satelligence_deforestation_over_georegion(geo_region_id uuid);
      DROP FUNCTION IF EXISTS sum_satelligence_deforestation_risk_over_georegion(geo_region_id uuid);
      -- TODO: Remove the rest of the stored procedures that are not used anymore
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
