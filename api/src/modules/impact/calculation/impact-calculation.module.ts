import { Module } from '@nestjs/common';
import { ImpactCalculation } from 'modules/impact/calculation/impact.calculation';
import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';

/**
 * @description: Module for the impact calculation services
 */

@Module({
  providers: [ImpactCalculation, IndicatorStrategyFactory],
  exports: [ImpactCalculation],
})
export class ImpactCalculationModule {}
