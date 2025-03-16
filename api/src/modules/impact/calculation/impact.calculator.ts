import { Injectable, Logger } from '@nestjs/common';
import {
  IndicatorStrategyFactory,
  IndicatorStrategyMap2,
} from './indicator.strategy.factory';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from '../../indicators/indicator.entity';
import { ImpactCalculationRepository } from './impact-calculation.repository';
import { SourcingRecordsWithIndicatorRawData } from '../../sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { IndicatorRecord } from '../../indicator-records/indicator-record.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ImpactPerLocationDependencyBuilder,
  DependenciesToCalculateImpact,
  IndicatorDependency,
} from 'modules/impact/calculation/impact-per-location.dependency.builder';
import { ProductionOrHarvestQuery } from './queries/production-and-harvest.query';
import {
  IndicatorCoefficientImpactQuery,
  IndicatorCoefficientImpactValue,
  IndicatorId,
} from './queries/indicator-coefficient-impact.query';
import {
  AnnualCommodityWeightedImpactQuery,
  TotalWeightedImpact,
} from './queries/annual-commodity-weighted-impact.query';
import { IndicatorCoefficient } from '../../indicator-coefficients/indicator-coefficient.entity';
import { SourcingLocation } from '../../sourcing-locations/sourcing-location.entity';
import { IndicatorDependencies } from './strategies/indicator-calculation.strategy.interface';

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
    const indicatorDependencies =
      await this.dependencyBuilder.buildIndicatorDependencies(
        activeIndicatorNameCodes,
      );

    const res = await this.processByLocation(indicatorDependencies);

    // TODO: Following that we cache dependencies, we might want to also cache the raw values that are already calculated, for example production and harvest for same
    //       material, or the results of other queries
  }

  async goCalculatingStuff(
    locationDependency: DependenciesToCalculateImpact[],
  ): Promise<any> {
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
    const materialIndicatorWeightedImpact =
      new AnnualCommodityWeightedImpactQuery(this.dataSource);

    const all = [];

    for (const location of locationDependency) {
      const {
        sourcingLocationId,
        materialH3DataSourceMap,
        geoRegionH3IndexList,
        indicatorDependencies,
        materialId,
        adminRegionId,
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

      const coefficientIndicatorRawImpact = new Map<
        INDICATOR_NAME_CODES,
        IndicatorCoefficientImpactValue
      >();
      const spatialIndicatorRawImpact = new Map<
        INDICATOR_NAME_CODES,
        TotalWeightedImpact
      >();

      try {
        for (const coefficientIndicator of indicatorDependencies.coefficient!) {
          // TODO: LF does not need spatial or coefficient, only production and harvest.
          //       Again, each indicator strategy should define its dependencies
          if (coefficientIndicator.nameCode === INDICATOR_NAME_CODES.LF) {
            continue;
          }
          const res =
            await indicatorCoefficientImpactQuery.getIndicatorCoefficientImpact(
              {
                materialId: materialId,
                adminRegionId: adminRegionId,
                indicatorId: coefficientIndicator.id,
              },
            );
          coefficientIndicatorRawImpact.set(coefficientIndicator.nameCode, res);
        }
        for (const nameCode of indicatorDependencies.spatial.keys()) {
          const indicatorH3DataSource =
            indicatorDependencies.spatial.get(nameCode)!;

          // TODO: I need to know, based on the indicator, which query to use. I should be able to define the dependencies in each strategy
          const materialImpact =
            await materialWeightedImpact.getAnnualCommodityWeightedImpactOverGeoRegion(
              indicatorH3DataSource,
              materialH3DataSourceMap.production,
              geoRegionH3IndexList,
            );

          // const materialIndicatorImpact =
          //   await materialIndicatorWeightedImpact.getAnnualCommodityWeightedImpactOverGeoRegion(
          //     indicatorH3DataSource,
          //     materialH3DataSourceMap.production,
          //     geoRegionH3IndexList,
          //   );

          spatialIndicatorRawImpact.set(nameCode, materialImpact);
        }

        all.push({
          sourcingLocationId,
          production,
          harvest,
          coefficientIndicatorRawImpact,
          spatialIndicatorRawImpact,
        });
      } catch (e) {
        this.logger.error(e);
        const failingLocation = location;
        throw e;
      }
    }
    return all;
  }

  async processByLocation(
    indicatorDependency: IndicatorDependency,
  ): Promise<any> {
    const repository = this.dataSource.getRepository(SourcingLocation);
    const totalCount = await repository.count();
    this.logger.log(
      `Starting to process impact for a total of: ${totalCount} locations`,
    );

    for (let i = 0; i < totalCount; i++) {
      const locations = await repository.find({
        skip: i,
        take: 1,
        select: ['id', 'materialId', 'geoRegionId', 'adminRegionId'],
      });
      const location = locations[0];
      this.logger.log(`Processing location with id: ${location.id}`);
      const sourcingLocationDependencies =
        await this.dependencyBuilder.buildDependencyMap(
          locations,
          indicatorDependency,
        );

      const singleImpact = await this.goCalculatingStuff(
        sourcingLocationDependencies,
      );

      this.logger.log(`Impact calculated for location with id: ${location.id}`);
    }

    return 'done';
  }

  // TODO: this should be the final step
  // private calculateImpactForRecord(
  //   rawData: SourcingRecordsWithIndicatorRawData,
  //   indicators: Indicator[],
  //   strategies: IndicatorStrategyMap2,
  // ): IndicatorRecord[] {
  //   const records: IndicatorRecord[] = [];
  //   for (const indicator of indicators) {
  //     const strategy = strategies.get(indicator.nameCode)!;
  //     const indicatorRecord = new IndicatorRecord();
  //     indicatorRecord.indicatorId = indicator.id;
  //     indicatorRecord.sourcingRecordId = rawData.sourcingRecordId;
  //     indicatorRecord.materialH3DataId = rawData.materialH3DataId;
  //     indicatorRecord.value = strategy.calculate({
  //       rawData,
  //       tonnage: rawData.tonnage,
  //       production: rawData.production,
  //     });
  //     indicatorRecord.scaler = rawData.production ?? null;
  //     records.push(indicatorRecord);
  //   }
  //   return records;
  // }
}
