import { Module } from '@nestjs/common';
import { ImpactCalculatorV2 } from 'modules/impact/calculation/impact.calculator';
import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';
import { ImpactPerLocationDependencyBuilder } from 'modules/impact/calculation/impact-per-location.dependency.builder';

/**
 * @description: Module for the impact calculation services
 */

@Module({
  providers: [
    ImpactCalculatorV2,
    IndicatorStrategyFactory,
    ImpactPerLocationDependencyBuilder,
    ImpactCalculationRepository,
  ],
  exports: [ImpactCalculatorV2],
})
export class ImpactCalculationModule {}
