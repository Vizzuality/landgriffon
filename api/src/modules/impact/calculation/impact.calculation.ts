import { Injectable, Logger } from '@nestjs/common';
import { IndicatorStrategyFactory } from './indicator.strategy.factory';
import { Indicator } from '../../indicators/indicator.entity';
import { ImpactCalculationRepository } from './impact-calculation.repository';
import { SourcingRecordsWithIndicatorRawData } from '../../sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';

@Injectable()
export class ImpactCalculation {
  logger: Logger = new Logger(ImpactCalculation.name);

  constructor(
    private readonly strategyFactory: IndicatorStrategyFactory,
    private readonly calculationRepository: ImpactCalculationRepository,
  ) {}

  async calculateImpact(
    activeIndicators: Indicator[],
  ): Promise<SourcingRecordsWithIndicatorRawData[]> {
    const activeIndicatorNameCodes = activeIndicators.map(
      (indicator) => indicator.nameCode,
    );
    const strategies = this.strategyFactory.getStrategies(
      activeIndicatorNameCodes,
    );
    return this.calculationRepository.calculateRawImpact(strategies);
  }
}
