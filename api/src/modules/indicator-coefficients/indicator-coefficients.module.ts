import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';
import { IndicatorCoefficientsController } from 'modules/indicator-coefficients/indicator-coefficients.controller';
import { IndicatorCoefficientsService } from 'modules/indicator-coefficients/indicator-coefficients.service';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorCoefficientRepository])],
  controllers: [IndicatorCoefficientsController],
  providers: [IndicatorCoefficientsService],
  exports: [IndicatorCoefficientsService],
})
export class IndicatorCoefficientsModule {}
