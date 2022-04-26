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
import { InterventionGeneratorService } from 'modules/scenario-interventions/services/intervention-generator.service';

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
  controllers: [ScenarioInterventionsController],
  providers: [ScenarioInterventionsService, InterventionGeneratorService],
  exports: [ScenarioInterventionsService],
})
export class ScenarioInterventionsModule {}
