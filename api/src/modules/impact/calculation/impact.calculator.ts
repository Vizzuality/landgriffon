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
import {
  ImpactPerLocationDependencyBuilder,
  SourcingLocationDependency,
} from 'modules/impact/calculation/impact-per-location.dependency.builder';
import { ProductionOrHarvestQuery } from './queries/production-and-harvest.query';
import { IndicatorCoefficientImpactQuery } from './queries/indicator-coefficient-impact.query';
import { AnnualCommodityWeightedImpactQuery } from './queries/annual-commodity-weighted-impact.query';

@Injectable()
export class ImpactCalculatorV2 {
  logger: Logger = new Logger(ImpactCalculatorV2.name);

  constructor(
    private readonly strategyFactory: IndicatorStrategyFactory,
    private readonly dependencyBuilder: ImpactPerLocationDependencyBuilder,
    private readonly calculationRepository: ImpactCalculationRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async calculateImpact(activeIndicators: Indicator[]): Promise<any> {
    const activeIndicatorNameCodes = activeIndicators.map(
      (indicator) => indicator.nameCode,
    );
    const strategyMap = this.strategyFactory.getStrategies(
      activeIndicatorNameCodes,
    );
    const sourcingLocationDependencies =
      await this.dependencyBuilder.buildDependencyMap(activeIndicatorNameCodes);
    // TODO: Following that we cache dependencies, we might want to also cache the raw values that are already calculated, for example production and harvest for same
    //       material, or the results of other queries
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

  async goCalculatingStuff(locationDependency: SourcingLocationDependency[]) {
    // TODO: We might want to also cache prod, harves, impact raw values if those are already calculated
    const productionAndHarvestQuery = new ProductionOrHarvestQuery(
      this.dataSource,
    );
    const indicatorCoefficientImpactQuery = new IndicatorCoefficientImpactQuery(
      this.dataSource,
    );

    const materialWeightedImpact = new AnnualCommodityWeightedImpactQuery(
      this.dataSource,
    );
    for (const location of locationDependency) {
      const {
        sourcingLocationId,
        materialH3DataSourceMap,
        geoRegionH3IndexList,
        indicatorH3DataSourceDependencyMap,
      } = location;
      const production = await productionAndHarvestQuery.sumH3GridOverGeoRegion(
        {
          geoRegionH3IndexList,
          materialH3DataSource: materialH3DataSourceMap.production,
        },
      );
      const harvest = await productionAndHarvestQuery.sumH3GridOverGeoRegion({
        geoRegionH3IndexList,
        materialH3DataSource: materialH3DataSourceMap.harvest,
      });
    }
  }
}
