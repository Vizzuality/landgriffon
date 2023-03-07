import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';
import { Intervention } from 'modules/interventions/intervention.entity';
import { ScenarioInterventionsController } from 'modules/interventions/scenario-interventions.controller';
import { InterventionsService } from 'modules/interventions/interventions.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { InterventionBuilder } from 'modules/interventions/services/intervention-builder.service';
import { NewMaterialIntervention } from 'modules/interventions/strategies/new-material.intervention.strategy';
import { NewSupplierLocationIntervention } from 'modules/interventions/strategies/new-supplier-location.intervention.strategy';
import { ChangeProductionEfficiencyIntervention } from 'modules/interventions/strategies/change-production-efficiency.intervention.strategy';
import { InterventionsController } from 'modules/interventions/interventions.controller';
import { ActiveIndicatorValidator } from 'modules/indicators/validators/active-indicator.validator';
import { InterventionRepository } from 'modules/interventions/intervention.repository';
import { AuthorizationModule } from 'modules/authorization/authorization.module';
import { MaterialsService } from 'modules/materials/materials.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intervention]),
    IndicatorRecordsModule,
    GeoCodingModule,
    SourcingLocationsModule,
    MaterialsModule,
    BusinessUnitsModule,
    AdminRegionsModule,
    SuppliersModule,
    AuthorizationModule,
  ],
  controllers: [InterventionsController],
  providers: [
    InterventionRepository,
    InterventionsService,
    InterventionBuilder,
    NewMaterialIntervention,
    NewSupplierLocationIntervention,
    ChangeProductionEfficiencyIntervention,
    ActiveIndicatorValidator,
    MaterialsService,
  ],
  exports: [InterventionRepository, InterventionsService],
})
export class InterventionsModule {}
