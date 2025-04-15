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
import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from '../../indicator-records/indicator-record.entity';
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
} from './queries/indicator-coefficient-impact.query';
import {
  AnnualCommodityWeightedImpactQuery,
  TotalWeightedImpact,
} from './queries/annual-commodity-weighted-impact.query';
import { SourcingLocation } from '../../sourcing-locations/sourcing-location.entity';
import { AnnualCommodityWeightedMaterialImpactQuery } from 'modules/impact/calculation/queries/annual-commodity-weighted-material-impact.query';

@Injectable()
export class ImpactCalculatorV2 {
  logger: Logger = new Logger(ImpactCalculatorV2.name);

  productionAndHarvestQuery: ProductionOrHarvestQuery;
  indicatorCoefficientImpactQuery: IndicatorCoefficientImpactQuery;
  materialWeightedImpact: AnnualCommodityWeightedImpactQuery;
  materialIndicatorWeightedImpact: AnnualCommodityWeightedImpactQuery;

  constructor(
    private readonly strategyFactory: IndicatorStrategyFactory,
    private readonly dependencyBuilder: ImpactPerLocationDependencyBuilder,
    private readonly calculationRepository: ImpactCalculationRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.productionAndHarvestQuery = new ProductionOrHarvestQuery(
      this.dataSource,
    );
    this.indicatorCoefficientImpactQuery = new IndicatorCoefficientImpactQuery(
      this.dataSource,
    );

    this.materialWeightedImpact = new AnnualCommodityWeightedImpactQuery(
      this.dataSource,
    );
    this.materialIndicatorWeightedImpact =
      new AnnualCommodityWeightedImpactQuery(this.dataSource);
  }

  async calculateImpact(activeIndicators: Indicator[]): Promise<any> {
    const activeIndicatorNameCodes = activeIndicators.map(
      (indicator) => indicator.nameCode,
    );
    const strategyMap = this.strategyFactory.getStrategies(
      activeIndicatorNameCodes,
      this.dataSource,
    );
    const indicatorDependencies =
      await this.dependencyBuilder.buildIndicatorDependencies(
        activeIndicatorNameCodes,
      );

    //const res = await this.processByLocation(indicatorDependencies);

    const sourcingLocations: SourcingLocation[] = await this.dataSource
      .getRepository(SourcingLocation)
      .find();
    const sourcingLocationDependencies =
      await this.dependencyBuilder.buildDependencyMap(
        sourcingLocations,
        indicatorDependencies,
      );
    // TODO: Following that we cache dependencies, we might want to also cache the raw values that are already calculated, for example production and harvest for same
    //       material, or the results of other queries

    await this.calculateIndicatorRecords(
      activeIndicators,
      strategyMap,
      sourcingLocationDependencies,
    );
  }

  /**
   * Initial version of the indicator records calculation, TODO to be refactored and improved
   * @param indicators
   * @param strategies
   * @param locationDependencies
   */
  async calculateIndicatorRecords(
    indicators: Indicator[],
    strategies: IndicatorStrategyMap2,
    locationDependencies: DependenciesToCalculateImpact[],
  ): Promise<void> {
    const indicatorRecordRepository =
      this.dataSource.getRepository(IndicatorRecord);

    for (const sourcingLocationDependency of locationDependencies) {
      const rawSourcingRecords: SourcingRecordsWithIndicatorRawData[] =
        await this.calculationRepository.calculateRawImpact(
          strategies.getQueryDependencies(),
          sourcingLocationDependency.sourcingLocationId,
        );

      for (const rawSourcingRecord of rawSourcingRecords) {
        const indicatorRecords: IndicatorRecord[] =
          this.calculateImpactForRecord(
            rawSourcingRecord,
            indicators,
            strategies,
          );
        await indicatorRecordRepository.insert(indicatorRecords);
      }
    }
  }

  async goCalculatingStuff(
    locationDependency: DependenciesToCalculateImpact,
  ): Promise<any> {
    // TODO: We might want to also cache prod, harves, impact raw values if those are already calculated

    const {
      sourcingLocationId,
      materialH3DataSourceMap,
      geoRegionH3IndexList,
      indicatorDependencies,
      materialId,
      adminRegionId,
    } = locationDependency;
    const production =
      await this.productionAndHarvestQuery.sumH3GridOverGeoRegion({
        geoRegionH3IndexList,
        materialH3DataSource: materialH3DataSourceMap.production,
      });
    const harvest = await this.productionAndHarvestQuery.sumH3GridOverGeoRegion(
      {
        geoRegionH3IndexList,
        materialH3DataSource: materialH3DataSourceMap.harvest,
      },
    );

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
          await this.indicatorCoefficientImpactQuery.getIndicatorCoefficientImpact(
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
          await this.materialWeightedImpact.getAnnualCommodityWeightedImpactOverGeoRegion(
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

      const productionValue = production.total_sum;
      const harvestValue = harvest.total_sum;
      const combinedMap = new Map([
        ...coefficientIndicatorRawImpact.entries(),
        ...spatialIndicatorRawImpact.entries(),
      ]);
      const impacts = Object.fromEntries(
        Array.from(combinedMap.entries()).map(([key, obj]) => [key, obj.value]),
      );
      const impactPerLocation = {
        sourcingLocationId,
        productionValue,
        harvestValue,
        ...impacts,
      };

      return impactPerLocation;
    } catch (e) {
      this.logger.error(e);
      const failingLocation = location;
      throw e;
    }
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
      /// WE need to explicitly state the order, to guarantee the same order in subsequent queries
      // https://stackoverflow.com/questions/11263715/is-postgresql-order-fully-guaranteed-if-sorting-on-a-non-unique-attribute

      const [location] = await repository.find({
        skip: i,
        take: 1,
        order: { id: 'ASC' },
        select: ['id', 'materialId', 'geoRegionId', 'adminRegionId'],
        relations: ['sourcingRecords'],
      });
      const sourcingRecords = location.sourcingRecords;
      this.logger.log(`Processing location with id: ${location.id}`);
      const [sourcingLocationDependencies] =
        await this.dependencyBuilder.buildDependencyMap(
          [location],
          indicatorDependency,
        );

      const singleImpact = await this.goCalculatingStuff(
        sourcingLocationDependencies,
      );
      const toSave = singleImpact;

      const allStuff = {
        ...toSave,
        sourcingRecords: sourcingRecords.map((record) => ({
          sourcingRecordId: record.id,
          tonnage: record.tonnage,
          year: record.year,
        })),
      };

      this.logger.log(`Impact calculated for location with id: ${location.id}`);
    }

    return 'done';
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
      indicatorRecord.status = INDICATOR_RECORD_STATUS.SUCCESS;
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

  /*
  // TODO this function precalculates the raw values before doing the impact calculation
  async goCalculatingStuff(
    indicators: Indicator[],
    strategies: IndicatorStrategyMap2,
    locationDependency: SourcingLocationDependency[],
  ) {
    // TODO: We might want to also cache prod, harves, impact raw values if those are already calculated
    // will either be refactored or deleted later
    const sumH3GridOverGeoRegionQuery = new ProductionOrHarvestQuery(
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
        materialH3DataSources,
        geoRegionH3IndexList,
        indicatorH3DataSourceDependencyMap,
      } = location;
      const production =
        await sumH3GridOverGeoRegionQuery.sumH3GridOverGeoRegion({
          geoRegionH3IndexList,
          materialH3DataSource: materialH3DataSources.production,
        });
      const harvest = await sumH3GridOverGeoRegionQuery.sumH3GridOverGeoRegion({
        geoRegionH3IndexList,
        materialH3DataSource: materialH3DataSources.harvest,
      });

      const rawSourcingRecords: SourcingRecordsWithIndicatorRawData[] =
        await this.calculationRepository.calculateRawImpact(
          strategies.getQueryDependencies(),
        );

      for (const rawSourcingRecord of rawSourcingRecords) {
        const indicatorRecords: IndicatorRecord[] =
          this.calculateImpactForRecord(
            rawSourcingRecord,
            indicators,
            strategies,
          );
      }
    }
  }

   */
}
