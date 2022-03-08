import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';

import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { ScenarioInterventionsController } from 'modules/scenario-interventions/scenario-interventions.controller';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenarioInterventionRepository]),
    IndicatorRecordsModule,
    GeoCodingModule,
    SourcingLocationsModule,
  ],
  controllers: [ScenarioInterventionsController],
  providers: [ScenarioInterventionsService],
  exports: [ScenarioInterventionsService],
})
export class ScenarioInterventionsModule {}
