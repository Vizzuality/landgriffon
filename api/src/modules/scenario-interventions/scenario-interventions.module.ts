import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
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
import { ScenarioInterventionsControllerV2 } from 'modules/scenario-interventions/interventions-controller-v2.controller';
import { ActiveIndicatorValidator } from 'modules/indicators/validators/active-indicator.validator';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { AuthorizationModule } from 'modules/authorization/authorization.module';
import { MaterialsService } from 'modules/materials/materials.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenarioIntervention]),
    IndicatorRecordsModule,
    GeoCodingModule,
    SourcingLocationsModule,
    MaterialsModule,
    BusinessUnitsModule,
    AdminRegionsModule,
    SuppliersModule,
    AuthorizationModule,
  ],
  controllers: [ScenarioInterventionsControllerV2],
  providers: [
    ScenarioInterventionRepository,
    ScenarioInterventionsService,
    InterventionBuilder,
    NewMaterialIntervention,
    NewSupplierLocationIntervention,
    ChangeProductionEfficiencyIntervention,
    ActiveIndicatorValidator,
    MaterialsService,
  ],
  exports: [ScenarioInterventionRepository, ScenarioInterventionsService],
})
export class ScenarioInterventionsModule {}
