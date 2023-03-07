import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ScenariosController } from 'modules/scenarios/scenarios.controller';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import { InterventionsModule } from 'modules/interventions/interventions.module';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import { AuthorizationModule } from 'modules/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scenario]),
    InterventionsModule,
    AuthorizationModule,
  ],
  controllers: [ScenariosController],
  providers: [ScenariosService, ScenarioRepository],
  exports: [ScenariosService, ScenarioRepository],
})
export class ScenariosModule {}
