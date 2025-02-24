import { Injectable } from '@nestjs/common';
import { IndicatorStrategyFactory } from './indicator.strategy.factory';

@Injectable()
export class ImpactCalculation {
  private registry: IndicatorStrategyFactory;

  constructor() {
    // TODO: Not sure if registry should be a injectable service, probably
    this.registry = new IndicatorStrategyFactory();
  }

  calculateImpact(): any {}
}
