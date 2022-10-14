import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';

import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { ScenarioInterventionsController } from 'modules/scenario-interventions/scenario-interventions.controller';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { InterventionBuilder } from 'modules/scenario-interventions/services/intervention-builder.service';
import { NewMaterialIntervention } from 'modules/scenario-interventions/strategies/new-material.intervention.strategy';
import { NewSupplierLocationIntervention } from 'modules/scenario-interventions/strategies/new-supplier-location.intervention.strategy';
import { ChangeProductionEfficiencyIntervention } from 'modules/scenario-interventions/strategies/change-production-efficiency.intervention.strategy';
import * as config from 'config';
import { ScenarioInterventionsControllerV2 } from 'modules/scenario-interventions/interventions-controller-v2.controller';
import { ActiveIndicatorValidator } from 'modules/indicators/validators/active-indicator.validator';

const useNewMethodology: boolean =
  `${config.get('newMethodology')}`.toLowerCase() === 'true';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenarioInterventionRepository]),
    IndicatorRecordsModule,
    GeoCodingModule,
    SourcingLocationsModule,
    MaterialsModule,
    BusinessUnitsModule,
    AdminRegionsModule,
    SuppliersModule,
  ],
  controllers: [
    ...(useNewMethodology
      ? [ScenarioInterventionsControllerV2]
      : [ScenarioInterventionsController]),
  ],
  providers: [
    ScenarioInterventionsService,
    InterventionBuilder,
    NewMaterialIntervention,
    NewSupplierLocationIntervention,
    ChangeProductionEfficiencyIntervention,
    ActiveIndicatorValidator,
  ],
  exports: [ScenarioInterventionsService],
})
export class ScenarioInterventionsModule {}
