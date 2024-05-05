import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { DataSource, EntityManager } from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';

export class SourcingDataDbCleaner {
  constructor(private readonly dataSource: DataSource) {}

  async cleanDataBeforeImport(): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.deleteExistingUserData(manager);
      await this.deactivateAllIndicators(manager);
      await this.deactivateAllMaterials(manager);
    });
  }

  private async deactivateAllIndicators(manager: EntityManager): Promise<void> {
    await manager.query('UPDATE indicators SET active = false');
  }

  private async deactivateAllMaterials(manager: EntityManager): Promise<void> {
    await manager.query('UPDATE materials SET active = false');
  }

  private async deleteExistingUserData(manager: EntityManager): Promise<void> {
    const entities: any = [Scenario, SourcingLocation, BusinessUnit, Supplier];
    for (const entity of entities) {
      await manager.getRepository(entity).delete({});
    }
    await this.deleteGeoRegionsCreatedByUser(manager);
  }

  private async deleteGeoRegionsCreatedByUser(
    manager: EntityManager,
  ): Promise<void> {
    await manager.getRepository(GeoRegion).delete({ isCreatedByUser: true });
  }
}
