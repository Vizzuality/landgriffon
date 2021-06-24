import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorRepository])],
})
export class IndicatorsModule {}
