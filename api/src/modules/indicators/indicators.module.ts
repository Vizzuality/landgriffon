import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { IndicatorsController } from 'modules/indicators/indicators.controller';
import { IndicatorsService } from 'modules/indicators/indicators.service';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorRepository])],
  controllers: [IndicatorsController],
  providers: [IndicatorsService],
  exports: [IndicatorsService],
})
export class IndicatorsModule {}
