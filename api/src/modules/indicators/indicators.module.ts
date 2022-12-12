import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { IndicatorsController } from 'modules/indicators/indicators.controller';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { ActiveIndicatorValidator } from 'modules/indicators/validators/active-indicator.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Indicator])],
  controllers: [IndicatorsController],
  providers: [IndicatorsService, IndicatorRepository, ActiveIndicatorValidator],
  exports: [IndicatorsService, IndicatorRepository],
})
export class IndicatorsModule {}
