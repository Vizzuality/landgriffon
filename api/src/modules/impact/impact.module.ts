import { Module } from '@nestjs/common';
import { ImpactService } from 'modules/impact/impact.service';
import { ImpactController } from 'modules/impact/impact.controller';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { ActualVsScenarioImpactService } from 'modules/impact/comparison/actual-vs-scenario.service';
import { ScenarioVsScenarioImpactService } from 'modules/impact/comparison/scenario-vs-scenario.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { AuthorizationModule } from 'modules/authorization/authorization.module';

@Module({
  imports: [
    IndicatorsModule,
    SourcingRecordsModule,
    BusinessUnitsModule,
    AdminRegionsModule,
    SuppliersModule,
    MaterialsModule,
    SourcingLocationsModule,
    AuthorizationModule,
  ],
  providers: [
    ImpactService,
    ActualVsScenarioImpactService,
    ScenarioVsScenarioImpactService,
    IndicatorsService,
    MaterialsService,
  ],
  controllers: [ImpactController],
  exports: [
    ImpactService,
    ActualVsScenarioImpactService,
    ScenarioVsScenarioImpactService,
  ],
})
export class ImpactModule {}
