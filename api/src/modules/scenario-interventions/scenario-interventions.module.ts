import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { ScenarioInterventionsController } from 'modules/scenario-interventions/scenario-interventions.controller';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioInterventionRepository])],
  controllers: [ScenarioInterventionsController],
  providers: [ScenarioInterventionsService],
  exports: [ScenarioInterventionsService],
})
export class ScenarioInterventionsModule {}
