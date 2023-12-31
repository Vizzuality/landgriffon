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
import { AuthorizationModule } from 'modules/authorization/authorization.module';
import { ImpactViewUpdater } from 'modules/impact/views/impact-view.updater';
import { BaseImpactService } from 'modules/impact/base-impact.service';
import { ImpactRepository } from 'modules/impact/impact.repository';
import { ImpactReportController } from 'modules/impact/impact-report.controller';
import { ImpactReportsModule } from 'modules/impact/reports/impact-reports.module';

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
    ImpactReportsModule,
  ],
  providers: [
    ImpactRepository,
    BaseImpactService,
    ImpactService,
    ActualVsScenarioImpactService,
    ScenarioVsScenarioImpactService,
    MaterialsService,
    ImpactViewUpdater,
  ],
  controllers: [ImpactController, ImpactReportController],
  exports: [
    ImpactService,
    ActualVsScenarioImpactService,
    ScenarioVsScenarioImpactService,
  ],
})
export class ImpactModule {}
