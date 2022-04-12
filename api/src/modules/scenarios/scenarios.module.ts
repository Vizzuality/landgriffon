import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import { ScenariosController } from 'modules/scenarios/scenarios.controller';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import { ScenarioInterventionsModule } from 'modules/scenario-interventions/scenario-interventions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenarioRepository]),
    ScenarioInterventionsModule,
  ],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}
