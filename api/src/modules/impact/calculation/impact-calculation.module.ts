import { Module } from '@nestjs/common';
import { ImpactCalculation } from 'modules/impact/calculation/impact.calculation';
import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';
import { ImpactQueryBuilderV2 } from 'modules/impact/calculation/impact-calculation.query.builder';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';

/**
 * @description: Module for the impact calculation services
 */

@Module({
  providers: [
    ImpactCalculation,
    IndicatorStrategyFactory,
    ImpactQueryBuilderV2,
    ImpactCalculationRepository,
  ],
  exports: [ImpactCalculation],
})
export class ImpactCalculationModule {}
