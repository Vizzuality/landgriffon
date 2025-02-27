import { Module } from '@nestjs/common';
import { ImpactCalculatorV2 } from 'modules/impact/calculation/impact.calculator';
import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';
import { ImpactQueryBuilderV2 } from 'modules/impact/calculation/impact-calculation.query.builder';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';

/**
 * @description: Module for the impact calculation services
 */

@Module({
  providers: [
    ImpactCalculatorV2,
    IndicatorStrategyFactory,
    ImpactQueryBuilderV2,
    ImpactCalculationRepository,
  ],
  exports: [ImpactCalculatorV2],
})
export class ImpactCalculationModule {}
