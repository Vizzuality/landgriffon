import { Injectable } from '@nestjs/common';
import { IndicatorStrategyFactory } from './indicator.strategy.factory';
import { Indicator } from '../../indicators/indicator.entity';
import { ImpactCalculationRepository } from './impact-calculation.repository';

@Injectable()
export class ImpactCalculation {
  constructor(
    private readonly strategyFactory: IndicatorStrategyFactory,
    private readonly calculationRepository: ImpactCalculationRepository,
  ) {}

  calculateImpact(activeIndicators: Indicator[]): any {
    const activeIndicatorNameCodes = activeIndicators.map(
      (indicator) => indicator.nameCode,
    );
    const strategies = this.strategyFactory.getStrategies(
      activeIndicatorNameCodes,
    );
    return this.calculationRepository.calculateRawImpact(strategies);
  }
}
