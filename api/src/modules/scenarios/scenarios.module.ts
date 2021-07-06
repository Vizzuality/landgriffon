import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import { ScenariosController } from 'modules/scenarios/scenarios.controller';
import { ScenariosService } from 'modules/scenarios/scenarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioRepository])],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}
