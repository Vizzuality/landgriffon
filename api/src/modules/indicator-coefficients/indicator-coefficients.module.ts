import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorCoefficientRepository])],
})
export class IndicatorCoefficientsModule {}
