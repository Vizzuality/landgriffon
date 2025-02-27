import { Injectable, Logger } from '@nestjs/common';
import {
  IndicatorStrategyFactory,
  IndicatorStrategyMap2,
} from './indicator.strategy.factory';
import { Indicator } from '../../indicators/indicator.entity';
import { ImpactCalculationRepository } from './impact-calculation.repository';
import { SourcingRecordsWithIndicatorRawData } from '../../sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { IndicatorRecord } from '../../indicator-records/indicator-record.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ImpactCalculatorV2 {
  logger: Logger = new Logger(ImpactCalculatorV2.name);

  constructor(
    private readonly strategyFactory: IndicatorStrategyFactory,
    private readonly calculationRepository: ImpactCalculationRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async calculateImpact(activeIndicators: Indicator[]): Promise<void> {
    const activeIndicatorNameCodes = activeIndicators.map(
      (indicator) => indicator.nameCode,
    );
    const strategyMap = this.strategyFactory.getStrategies(
      activeIndicatorNameCodes,
    );
    this.logger.log('Calculating raw impact in DB...');
    const res = await this.calculationRepository.calculateRawImpact(
      strategyMap.getQueryDependencies(),
    );
    this.logger.log('Calculating impact for each record...');
    // TODO: Check to run parallel inserts, make it transactional etc...
    for (const rawData of res) {
      const impactRecords = this.calculateImpactForRecord(
        rawData,
        activeIndicators,
        strategyMap,
      );
      this.logger.log(
        `Inserting ${impactRecords.length} records from a total of ${res.length}...`,
      );
      await this.calculationRepository.saveImpactRecords(impactRecords);
    }
    this.logger.log('Impact calculation finished.');
  }

  private calculateImpactForRecord(
    rawData: SourcingRecordsWithIndicatorRawData,
    indicators: Indicator[],
    strategies: IndicatorStrategyMap2,
  ): IndicatorRecord[] {
    const records: IndicatorRecord[] = [];
    for (const indicator of indicators) {
      const strategy = strategies.get(indicator.nameCode)!;
      const indicatorRecord = new IndicatorRecord();
      indicatorRecord.indicatorId = indicator.id;
      indicatorRecord.sourcingRecordId = rawData.sourcingRecordId;
      indicatorRecord.materialH3DataId = rawData.materialH3DataId;
      indicatorRecord.value = strategy.calculate({
        rawData,
        tonnage: rawData.tonnage,
        production: rawData.production,
      });
      indicatorRecord.scaler = rawData.production ?? null;
      records.push(indicatorRecord);
    }
    return records;
  }
}
