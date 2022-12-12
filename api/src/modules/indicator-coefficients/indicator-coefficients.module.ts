import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorCoefficientsController } from 'modules/indicator-coefficients/indicator-coefficients.controller';
import { IndicatorCoefficientsService } from 'modules/indicator-coefficients/indicator-coefficients.service';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorCoefficient])],
  controllers: [IndicatorCoefficientsController],
  providers: [IndicatorCoefficientsService, IndicatorCoefficientRepository],
  exports: [IndicatorCoefficientsService],
})
export class IndicatorCoefficientsModule {}
