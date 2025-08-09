import { Injectable, Logger } from '@nestjs/common';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from 'modules/indicator-records/indicator-record.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { AppConfig } from 'utils/app.config';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import {
  AdminRegionId,
  GeoRegionId,
  H3GridSum,
  ImpactCalculationRepository,
  MaterialId,
} from 'modules/impact/calculation/impact-calculation.repository';
import {
  IndicatorCalculationStrategy,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import {
  IndicatorStrategyFactory,
  IndicatorStrategyMap,
} from 'modules/impact/calculation/indicator.strategy.factory';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';

@Injectable()
export class ImpactCalculatorV2 {
  logger: Logger = new Logger(ImpactCalculatorV2.name);

  useDistributedImpact: boolean;
  datasource: DataSource;

  constructor(
    private readonly strategyFactory: IndicatorStrategyFactory,
    private readonly calculationRepository: ImpactCalculationRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.useDistributedImpact = AppConfig.getBoolean(
      'flags.useDistributedImpact',
      false,
    );
  }

  async calculateImpactForAllLocations(
    activeIndicators: Indicator[],
  ): Promise<any> {
    const repo = this.dataSource.getRepository(SourcingLocation);
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();

    try {
      const stream = await runner.manager
        .createQueryBuilder(SourcingLocation, 'sl')
        .select('sl.id', 'id')
        .orderBy('sl.id', 'ASC') // Ensure order is consisten. We might use this also for resuming, retrying, etc.
        .stream();

      for await (const location of stream as AsyncIterable<{ id: string }>) {
        const sourcingLocation: SourcingLocation = await repo.findOneOrFail({
          where: { id: location.id },
          relations: ['sourcingRecords'],
        });
        await this.calculateImpacts(activeIndicators, [sourcingLocation]);
      }
    } catch (e: any) {
      this.logger.error(
        `Error while calculating impacts for all locations: ${e.message}`,
      );
      throw e; // Re-throw the error to be handled by the caller
    }
  }

  async calculateImpacts(
    activeIndicators: Indicator[],
    locations: SourcingLocation[],
  ): Promise<any> {
    this.logger.log(`Processing impact for location ID: ${locations[0].id}`);
    // Get the strategies sorted by priority
    const strategyMap = this.strategyFactory.getStrategies(activeIndicators);
    const sortedStrategies = strategyMap.getSortedStrategies();

    for (const location of locations) {
      // Need to get the material's Production H3 data source and value to be set in the corresponding indicator records
      // IMPORTANT : this mirrors the original approach, which is incorrect to begin with, as some indicators depend on the
      // associated Material Indicator H3 data source, instead of the Material H3 Data source.
      // TODO This is a temporary solution until we refactor the indicator records to probably remove that relation, which
      // is really only used for a small optimization when showing map data
      const productionH3DataSource =
        await this.calculationRepository.getMaterialH3DataSource(
          new MaterialId(location.materialId),
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );

      // TODO: We might use a key using the location info (country + address/coordinates/whatever) to avoid calculating H3 indexes if they are already calculated for
      //       the same location. We could also cache other opeations as well
      const geoRegionH3IndexList =
        await this.calculationRepository.getGeoRegionH3IndexList({
          geoRegionId: new GeoRegionId(location.geoRegionId),
        });
      const productionValue =
        await this.calculationRepository.sumH3GridOverGeoRegion({
          geoRegionH3IndexList,
          materialH3DataSource: productionH3DataSource,
        });

      // Precalculate all the values for each strategy, that are dependent on the location, and not for each sourcing record
      const preCalculationResults: Map<
        INDICATOR_NAME_CODES,
        PreCalculationResult
      > = new Map();
      for (const strategy of sortedStrategies) {
        const result = await strategy.preCalculate({
          adminRegionId: new AdminRegionId(location.adminRegionId),
          geoRegionId: new GeoRegionId(location.geoRegionId),
          materialId: new MaterialId(location.materialId),
        });
        preCalculationResults.set(strategy.indicator.nameCode, result);
      }

      for (const sourcingRecord of location.sourcingRecords) {
        const calculatedImpacts = new Map<INDICATOR_NAME_CODES, number>();

        // Now calculate the final impact values for each sourcing record, based on the precalculated values
        for (const strategy of sortedStrategies) {
          const preCalculationValues = preCalculationResults.get(
            strategy.indicatorCode,
          )!;

          const calculatedImpact = await strategy.calculate({
            calculatedImpacts,
            preCalculationValues,
            tonnage: sourcingRecord.tonnage,
          });

          calculatedImpacts.set(strategy.indicatorCode, calculatedImpact);
        }

        /////// Calculate and store the indicator records
        const indicatorRecords: IndicatorRecord[] =
          this.calculateIndicatorRecords(
            sourcingRecord.id,
            sortedStrategies,
            productionH3DataSource.id.value,
            productionValue.value,
            calculatedImpacts,
          );
        await this.dataSource
          .getRepository(IndicatorRecord)
          .insert(indicatorRecords);
      }

      this.logger.log(
        `Impacts calculated for location with id: ${location.id}`,
      );
    }
    return 'done';
  }

  async calculateImpactForInterventionLocations(
    activeIndicators: Indicator[],
    locations: SourcingLocation[],
    providedCoefficients?: IndicatorCoefficientsDto,
  ): Promise<void> {
    this.logger.log(
      `Starting to process impact for a total of: ${locations.length} locations`,
    );
    const strategyMap = this.strategyFactory.getStrategies(activeIndicators);

    const sortedStrategies = strategyMap.getSortedStrategies();

    for (const location of locations) {
      // IMPORTANT:  SEE ABOVE on the calculateImpacts function
      const productionH3DataSource =
        await this.calculationRepository.getMaterialH3DataSource(
          new MaterialId(location.materialId),
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
      const geoRegionH3IndexList =
        await this.calculationRepository.getGeoRegionH3IndexList({
          geoRegionId: new GeoRegionId(location.geoRegionId),
        });
      let productionValue: H3GridSum;

      if (providedCoefficients) {
        /////// If the user provided coefficients, calculations will be done with these values instead of the normal flow
        for (const sourcingRecord of location.sourcingRecords) {
          // TODO IS THIS CORRECT??
          // Getting production / scaler value from received sourcing record or finding it by material h3 data and georegion
          if (sourcingRecord.indicatorRecords) {
            productionValue = new H3GridSum(
              sourcingRecord!.indicatorRecords[0].scaler || 0,
            );
          } else {
            // Calculate new scaler value because it didn't exist
            productionValue =
              await this.calculationRepository.sumH3GridOverGeoRegion({
                geoRegionH3IndexList,
                materialH3DataSource: productionH3DataSource,
              });
          }

          const indicatorRecords: IndicatorRecord[] =
            this.calculateIndicatorRecordsWithProvidedCoefficients(
              sourcingRecord.id,
              sourcingRecord.tonnage,
              sortedStrategies,
              productionH3DataSource.id.value,
              productionValue.value,
              providedCoefficients,
            );

          await this.dataSource
            .getRepository(IndicatorRecord)
            .insert(indicatorRecords);
        }
      } else {
        ////// Calculate all the values for each strategy normally
        productionValue =
          await this.calculationRepository.sumH3GridOverGeoRegion({
            geoRegionH3IndexList,
            materialH3DataSource: productionH3DataSource,
          });

        // Precalculate all the values for each strategy, that are dependent on the location, and not for each sourcing record
        const preCalculationResults: Map<
          INDICATOR_NAME_CODES,
          PreCalculationResult
        > = new Map();
        for (const strategy of sortedStrategies) {
          const result = await strategy.preCalculate({
            adminRegionId: new AdminRegionId(location.adminRegionId),
            geoRegionId: new GeoRegionId(location.geoRegionId),
            materialId: new MaterialId(location.materialId),
          });
          preCalculationResults.set(strategy.indicator.nameCode, result);
        }

        // Calculate the indicator impacts for each sourcing record and save them
        for (const sourcingRecord of location.sourcingRecords) {
          // This maps holds the final calculated impact values for each indicator so far, to be used if required by the strategy
          const calculatedImpacts = new Map<INDICATOR_NAME_CODES, number>();

          // Now calculate the final impact values for each indicator, based on the precalculated values
          for (const strategy of sortedStrategies) {
            const preCalculationValues = preCalculationResults.get(
              strategy.indicatorCode,
            )!;

            const calculatedImpact = await strategy.calculate({
              calculatedImpacts,
              preCalculationValues,
              tonnage: sourcingRecord.tonnage,
            });

            calculatedImpacts.set(strategy.indicatorCode, calculatedImpact);
          }

          const indicatorRecords: IndicatorRecord[] =
            this.calculateIndicatorRecords(
              sourcingRecord.id,
              sortedStrategies,
              productionH3DataSource.id.value,
              productionValue.value,
              calculatedImpacts,
            );
          await this.dataSource
            .getRepository(IndicatorRecord)
            .insert(indicatorRecords);
        }
      }
    }
  }

  private calculateIndicatorRecords(
    sourcingRecordId: string,
    strategies: IndicatorCalculationStrategy[],
    materialH3DataId: string,
    production: number | null,
    calculatedImpacts: Map<INDICATOR_NAME_CODES, number>,
  ): IndicatorRecord[] {
    const records: IndicatorRecord[] = [];
    for (const strategy of strategies) {
      const indicatorRecord = new IndicatorRecord();
      indicatorRecord.indicatorId = strategy.indicator.id;
      indicatorRecord.sourcingRecordId = sourcingRecordId;
      indicatorRecord.materialH3DataId = materialH3DataId; // production H3 data id
      indicatorRecord.status = INDICATOR_RECORD_STATUS.SUCCESS;
      indicatorRecord.value = calculatedImpacts.get(
        strategy.indicator.nameCode,
      )!;
      indicatorRecord.scaler = production ?? null;
      records.push(indicatorRecord);
    }
    return records;
  }

  /**
   * @description: Calculates Indicator values by using only the provided indicator coefficients instead of the usually
   * strategy calculated values
   */
  private calculateIndicatorRecordsWithProvidedCoefficients(
    sourcingRecordId: string,
    tonnage: number,
    strategies: IndicatorCalculationStrategy[],
    materialH3DataId: string,
    production: number | null,
    newIndicatorCoefficients: IndicatorCoefficientsDto,
  ): IndicatorRecord[] {
    const records: IndicatorRecord[] = [];
    for (const strategy of strategies) {
      const indicatorRecord = new IndicatorRecord();
      indicatorRecord.indicatorId = strategy.indicator.id;
      indicatorRecord.sourcingRecordId = sourcingRecordId;
      indicatorRecord.materialH3DataId = materialH3DataId; // production H3 data id
      indicatorRecord.status = INDICATOR_RECORD_STATUS.SUCCESS;
      indicatorRecord.value =
        newIndicatorCoefficients[
          strategy.indicatorCode as INDICATOR_NAME_CODES
        ] * tonnage || 0;
      indicatorRecord.scaler = production ?? null;

      records.push(indicatorRecord);
    }

    return records;
  }
}
