import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { SourcingRecordsWithIndicatorRawData } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import {
  Indicator,
  INDICATOR_NAME_CODES,
  INDICATOR_STATUS,
} from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from 'modules/indicator-records/indicator-record.entity';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { IndicatorRecordCalculatedValuesDto } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { ImpactQueryBuilder } from 'modules/indicator-records/services/indicator-dependency-manager.service';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import {
  CACHED_DATA_TYPE,
  CachedData,
} from 'modules/cached-data/cached-data.entity';
import { ImpactCalculationProgressTracker } from 'modules/impact/progress-tracker/impact-calculation.progress-tracker';
import { ImportProgressTrackerFactory } from 'modules/events/import-data-progress/import-progress.tracker.factory';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { AppConfig } from 'utils/app.config';
import { TasksService } from '../../tasks/tasks.service';

/**
 * @description: This is PoC (Proof of Concept) for the updated LG methodology v0.1
 *               Needs to be properly implemented (following the current methodology pattern)
 *               as soon as results are validated
 */

export interface CachedRawData {
  rawData: SourcingRecordsWithIndicatorRawData;
}

@Injectable()
export class ImpactCalculator {
  logger: Logger = new Logger(ImpactCalculator.name);

  constructor(
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly materialToH3: MaterialsToH3sService,
    private readonly indicatorService: IndicatorsService,
    private readonly dependencyManager: ImpactQueryBuilder,
    private readonly cachedDataService: CachedDataService,
    private readonly dataSource: DataSource,
    private readonly importProgressTrackerFactory: ImportProgressTrackerFactory,
    private readonly taskService: TasksService,
  ) {}

  async calculateImpactForAllSourcingRecords(
    activeIndicators: Indicator[],
  ): Promise<void> {
    const totalEstimatedTime: number = 600000; // 10 minutos
    const halfTime: number = totalEstimatedTime / 2; // La mitad del tiempo para esta tarea
    const progressIncrement: number = 50 / (halfTime / 1000); // Cálculo para incrementar al 50%
    const tracker: ImpactCalculationProgressTracker =
      this.importProgressTrackerFactory.createImpactCalculationProgressTracker({
        totalRecords: 1,
        totalChunks: 1,
        startingPercentage: 0,
      });

    tracker.startProgressInterval(progressIncrement, 50);
    let rawData: SourcingRecordsWithIndicatorRawData[];
    try {
      rawData = await this.getImpactRawDataForAllSourcingRecords(
        activeIndicators,
      );
      tracker.stopProgressInterval();
    } catch (error: any) {
      tracker.stopProgressInterval();
      throw error;
    }

    const newImpactToBeSaved: IndicatorRecord[] = [];

    const useDistributedImpact: boolean = AppConfig.getBoolean(
      'flags.useDistributedImpact',
      false,
    );
    if (useDistributedImpact) {
      this.logger.warn('Calculating distributed impact over geo region');
      rawData = await this.updateDistributedImpactOverGeoRegion(
        rawData,
        activeIndicators,
      );
    }
    for (const data of rawData) {
      const indicatorValues: Map<INDICATOR_NAME_CODES, number> =
        await this.calculateIndicatorValues(data, data.tonnage);

      activeIndicators.forEach((indicator: Indicator) => {
        newImpactToBeSaved.push(
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: indicatorValues.get(indicator.nameCode),
            indicatorId: indicator.id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: data.sourcingRecordId,
            scaler: data.production,
            materialH3DataId: data.materialH3DataId,
          }),
        );
      });
    }

    await this.indicatorRecordRepository.saveChunks(newImpactToBeSaved);
  }

  async createIndicatorRecordsBySourcingRecords(
    sourcingData: {
      sourcingRecordId: string;
      geoRegionId: string;
      materialId: string;
      adminRegionId: string;
      tonnage: number;
      year: number;
      sourcingRecord?: SourcingRecord;
    },
    providedCoefficients?: IndicatorCoefficientsDto,
  ): Promise<any> {
    const {
      geoRegionId,
      materialId,
      adminRegionId,
      tonnage,
      sourcingRecordId,
    } = sourcingData;

    let calculatedIndicatorRecordValues: IndicatorRecordCalculatedValuesDto;
    const indicatorRecords: IndicatorRecord[] = [];
    const materialH3s: MaterialToH3 | null = await this.materialToH3.findOne({
      where: { materialId },
    });
    if (!materialH3s) {
      throw new MissingH3DataError();
    }

    const indicatorsToCalculateImpactFor: Indicator[] =
      await this.indicatorService.findAllIndicators({
        status: INDICATOR_STATUS.ACTIVE,
      });
    let rawData: SourcingRecordsWithIndicatorRawData =
      new SourcingRecordsWithIndicatorRawData();

    if (providedCoefficients) {
      calculatedIndicatorRecordValues = this.useProvidedIndicatorCoefficients(
        providedCoefficients,
        { sourcingRecordId, tonnage },
        materialH3s.h3DataId,
      );

      // Getting production / scaler value from received sourcing record of finding it by material h3 data and georegion
      if (this.requiresNewProductionValue(sourcingData.sourcingRecord)) {
        // Calculate new scaler value because it didn't exist
        rawData.production =
          await this.getProductionValueForGeoregionAndMaterial(
            geoRegionId,
            materialId,
          );
      } else {
        rawData.production =
          sourcingData.sourcingRecord!.indicatorRecords[0].scaler;
      }
    } else {
      rawData = await this.getImpactRawDataPerSourcingRecordCached(
        indicatorsToCalculateImpactFor.map(
          (i: Indicator) => i.nameCode as INDICATOR_NAME_CODES,
        ),
        materialId,
        geoRegionId,
        adminRegionId,
      );

      calculatedIndicatorRecordValues =
        new IndicatorRecordCalculatedValuesDto();

      calculatedIndicatorRecordValues.values =
        await this.calculateIndicatorValues(rawData, sourcingData.tonnage);
    }

    indicatorsToCalculateImpactFor.forEach((indicator: Indicator) => {
      indicatorRecords.push(
        IndicatorRecord.merge(new IndicatorRecord(), {
          value: calculatedIndicatorRecordValues.values.get(indicator.nameCode),
          indicatorId: indicator.id,
          status: INDICATOR_RECORD_STATUS.SUCCESS,
          sourcingRecordId: sourcingData.sourcingRecordId,
          scaler: rawData?.production ?? null,
          materialH3DataId: materialH3s.h3DataId,
        }),
      );
    });

    return indicatorRecords;
  }

  private async getImpactRawDataPerSourcingRecordCached(
    indicators: INDICATOR_NAME_CODES[],
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): Promise<any> {
    const cacheKey: any = this.generateIndicatorCalculationCacheKey(
      indicators,
      materialId,
      geoRegionId,
      adminRegionId,
    );

    const cachedData: CachedData | null =
      await this.cachedDataService.getCachedDataByKey(
        cacheKey,
        CACHED_DATA_TYPE.RAW_VALUES_GEOREGION,
      );

    if (cachedData) {
      return (cachedData.data as CachedRawData).rawData;
    }

    const cachedRawValue: CachedRawData = {
      rawData: await this.getImpactRawDataPerSourcingRecord(
        indicators,
        materialId,
        geoRegionId,
        adminRegionId,
      ),
    };

    await this.cachedDataService.createCachedData(
      cacheKey,
      cachedRawValue,
      CACHED_DATA_TYPE.RAW_VALUES_GEOREGION,
    );

    return cachedRawValue.rawData;
  }

  private async getImpactRawDataPerSourcingRecord(
    indicators: INDICATOR_NAME_CODES[],
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): Promise<SourcingRecordsWithIndicatorRawData> {
    const dynamicQuery: string =
      this.dependencyManager.buildQueryForIntervention(indicators);

    try {
      const res: any[] = await this.dataSource.query(`SELECT ${dynamicQuery}`, [
        geoRegionId,
        materialId,
        adminRegionId,
      ]);
      return res[0];
    } catch (error: any) {
      throw new ServiceUnavailableException(
        `Could not calculate Raw Indicator values for new Scenario ` + error,
      );
    }
  }

  async getProductionValueForGeoregionAndMaterial(
    geoRegionId: string,
    materialId: string,
  ): Promise<number> {
    const res: { production: number }[] = await this.dataSource.query(
      `SELECT sum_material_over_georegion($1, $2, 'producer') as production`,
      [geoRegionId, materialId],
    );

    if (!res.length) {
      throw new ServiceUnavailableException(
        `Could not calculate production for the given location`,
      );
    }
    return res[0].production;
  }

  /**
   * @description: Calculates Indicator values by the tonnage of the impact and estimates (coefficients) provided
   * by the user, for each possible indicator passed in an array
   */
  private useProvidedIndicatorCoefficients(
    newIndicatorCoefficients: IndicatorCoefficientsDto,
    sourcingData: { sourcingRecordId: string; tonnage: number },
    materialH3DataId: string,
  ): IndicatorRecordCalculatedValuesDto {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();
    calculatedIndicatorValues.sourcingRecordId = sourcingData.sourcingRecordId;
    calculatedIndicatorValues.materialH3DataId = materialH3DataId;
    calculatedIndicatorValues.values = new Map<INDICATOR_NAME_CODES, number>();
    Object.keys(INDICATOR_NAME_CODES).forEach((nameCode: string) => {
      calculatedIndicatorValues.values.set(
        nameCode as INDICATOR_NAME_CODES,
        newIndicatorCoefficients[nameCode as INDICATOR_NAME_CODES] *
          sourcingData.tonnage || 0,
      );
    });

    return calculatedIndicatorValues;
  }

  private requiresNewProductionValue(sourcingRecord?: SourcingRecord): boolean {
    return !sourcingRecord || !sourcingRecord.indicatorRecords;
  }

  private async calculateIndicatorValues(
    rawData: SourcingRecordsWithIndicatorRawData,
    tonnage: number,
  ): Promise<Map<INDICATOR_NAME_CODES, number>> {
    const map: Map<INDICATOR_NAME_CODES, number> = new Map();
    const landPerTon: number = Number.isFinite(
      rawData.harvest / rawData.production,
    )
      ? rawData.harvest / rawData.production
      : 0;
    map.set(INDICATOR_NAME_CODES.LF, landPerTon * tonnage);
    const getLF = (): number => map.get(INDICATOR_NAME_CODES.LF) ?? 0;
    const getPreprocessed = (indicator: INDICATOR_NAME_CODES): number => {
      return Number.isFinite(rawData[indicator] / rawData.production)
        ? rawData[indicator] / rawData.production
        : 0;
    };

    map.set(INDICATOR_NAME_CODES.LF, landPerTon * tonnage);
    const calculations: Record<INDICATOR_NAME_CODES, () => number> = {
      [INDICATOR_NAME_CODES.LF]: getLF,
      [INDICATOR_NAME_CODES.DF_SLUC]: () => {
        const preProcessed: number = getPreprocessed(
          INDICATOR_NAME_CODES.DF_SLUC,
        );
        return preProcessed * getLF();
      },
      [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: () => {
        const preProcessed: number = getPreprocessed(
          INDICATOR_NAME_CODES.GHG_DEF_SLUC,
        );
        return preProcessed * getLF();
      },
      [INDICATOR_NAME_CODES.NCE]: () => {
        const preProcessed: number = getPreprocessed(INDICATOR_NAME_CODES.NCE);
        return preProcessed * getLF();
      },
      [INDICATOR_NAME_CODES.FLIL]: () => {
        const preProcessed: number = getPreprocessed(INDICATOR_NAME_CODES.FLIL);
        return preProcessed * getLF();
      },
      [INDICATOR_NAME_CODES.GHG_FARM]: () => {
        const preProcessed: number = getPreprocessed(
          INDICATOR_NAME_CODES.GHG_FARM,
        );
        return preProcessed * rawData.tonnage || 0;
      },
      [INDICATOR_NAME_CODES.WU]: () => {
        return rawData[INDICATOR_NAME_CODES.WU] * tonnage || 0;
      },
      [INDICATOR_NAME_CODES.UWU]: () => {
        const waterUseValue: number =
          rawData[INDICATOR_NAME_CODES.WU] * tonnage;
        return rawData.production > 0
          ? (rawData[INDICATOR_NAME_CODES.UWU] * waterUseValue) /
              (100 * rawData.production) || 0
          : (rawData.distributedImpact?.[INDICATOR_NAME_CODES.UWU] ?? 0) *
              (waterUseValue / 100) || 0;
      },
      [INDICATOR_NAME_CODES.NL]: () => {
        return rawData[INDICATOR_NAME_CODES.NL] * tonnage || 0;
      },
      [INDICATOR_NAME_CODES.ENL]: () => {
        const nutrientLoad: number =
          rawData[INDICATOR_NAME_CODES.NL] * tonnage || 0;
        return rawData.production > 0
          ? (rawData[INDICATOR_NAME_CODES.ENL] * nutrientLoad) /
              (100 * rawData.production) || 0
          : (rawData.distributedImpact?.[INDICATOR_NAME_CODES.ENL] ?? 0) *
              (nutrientLoad / 100) || 0;
      },
      [INDICATOR_NAME_CODES.WW]: () => {
        return rawData[INDICATOR_NAME_CODES.WW] * tonnage || 0;
      },
      [INDICATOR_NAME_CODES.WC]: () => {
        return rawData[INDICATOR_NAME_CODES.WC] * tonnage || 0;
      },
      [INDICATOR_NAME_CODES.WGUWU]: () => {
        const waterWithdrawalValue: number =
          rawData[INDICATOR_NAME_CODES.WW] * tonnage || 0;
        return rawData.production > 0
          ? (rawData[INDICATOR_NAME_CODES.WGUWU] * waterWithdrawalValue) /
              (100 * rawData.production) || 0
          : (rawData.distributedImpact?.[INDICATOR_NAME_CODES.UWU] ?? 0) *
              (waterWithdrawalValue / 100) || 0;
      },
      [INDICATOR_NAME_CODES.WGSWU_NEW]: () => {
        const bwsInStressedAreas: number = rawData.BWS_IN_STRESSED_AREAS;
        const stressAreaPortion: number = rawData.STRESSED_AREA_PORTION;
        const excessBws =
          bwsInStressedAreas > 0.4
            ? bwsInStressedAreas - 0.4 / bwsInStressedAreas
            : 0;
        const waterWithdrawalValue: number =
          rawData[INDICATOR_NAME_CODES.WW] * tonnage || 0;
        const WGSWU_NEW: number =
          excessBws * stressAreaPortion * waterWithdrawalValue;
        return WGSWU_NEW;
      },
    };

    for (const [key, value] of Object.entries(calculations)) {
      map.set(key as INDICATOR_NAME_CODES, value());
    }
    return map;
  }

  private generateIndicatorCalculationCacheKey(
    indicators: INDICATOR_NAME_CODES[],
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): any {
    return {
      // Sort the indicator list to guarantee that the same set of indicator types won't result in different keys
      // because of their order
      indicators: indicators.sort(
        (a: INDICATOR_NAME_CODES, b: INDICATOR_NAME_CODES) =>
          a.toString() > b.toString() ? -1 : 1,
      ),
      materialId,
      geoRegionId,
      adminRegionId,
    };
  }

  async getImpactRawDataForAllSourcingRecords(
    activeIndicators: Indicator[],
  ): Promise<SourcingRecordsWithIndicatorRawData[]> {
    const { params, query } = this.dependencyManager.buildQueryForImport(
      activeIndicators.map(
        (indicator: Indicator) => indicator.nameCode as INDICATOR_NAME_CODES,
      ),
    );
    try {
      // TODO due to possible performance issues this query that makes use of the stored procedures for
      //      indicator value calculation has not been refactored. It remains to be reworked
      const response: any = await this.dataSource.query(
        `
          SELECT
            -- TODO: Hack to retrieve 1 materialH3Id for each sourcingRecord. This should include a year fallback strategy in the stored procedures
            --       used below
            distinct
          on (sr.id)
            sr.id as "sourcingRecordId",
            sr.tonnage,
            sr.year,
            slwithmaterialh3data.id as "sourcingLocationId",
            slwithmaterialh3data."materialH3DataId",
            ${params}

          FROM
            sourcing_records sr
            INNER JOIN
            (
            SELECT
            sourcing_location.id, "scenarioInterventionId", "interventionType", mth."h3DataId" as "materialH3DataId", ${query}
            FROM
            sourcing_location
            inner join
            material_to_h3 mth
            on
            mth."materialId" = sourcing_location."materialId"
            WHERE "scenarioInterventionId" IS NULL
            AND "interventionType" IS NULL
            and mth."type" = 'producer'
            ) as slwithmaterialh3data
          on sr."sourcingLocationId" = slwithmaterialh3data.id`,
      );
      if (!response.length)
        this.logger.warn(
          `Could not retrieve Sourcing Records with weighted indicator values`,
        );

      return response;
    } catch (err: any) {
      this.logger.error(
        `Error querying data from DB to calculate Indicator Records: ${err.message}`,
      );
      throw new MissingH3DataError(
        `Could net retrieve Indicator Raw data from Sourcing Locations: ${err}`,
      );
    }
  }

  async getDistributedImpactOverGeoRegion(
    geoRegionId: string,
    nameCode: INDICATOR_NAME_CODES,
  ): Promise<number> {
    const res: { distributed_impact: number }[] = await this.dataSource.query(
      `select get_annual_unweighted_impact_over_georegion($1, $2) as distributed_impact`,
      [geoRegionId, nameCode],
    );

    if (!res.length) {
      throw new ServiceUnavailableException(
        `Could not calculate production for the given location`,
      );
    }
    return res[0].distributed_impact;
  }

  // TODO: Quick and dirty implementation. Needs to be removed when we refactor the impact calculation flow
  //       Only applies for WGSWU_NEW when there is no production data for a specific location
  //       ALSO: Since I am missing in the notebook how the weighted values for this indicator are computed, I am assuming
  //       that the computation remains the same, I am just usins the values coming from this query
  async getDistributedImpactForWGSWU_NEW(geoRegionId: string): Promise<{
    BWS_IN_STRESSED_AREAS: number;
    STRESSED_AREA_PORTION: number;
  }> {
    const nameCode = INDICATOR_NAME_CODES.WGSWU_NEW;
    const res: {
      BWS_IN_STRESSED_AREAS: number;
      STRESSED_AREA_PORTION: number;
    }[] = await this.dataSource.query(
      `
    select get_bws_in_stressed_areas_unweighted($1, $2) as "BWS_IN_STRESSED_AREAS",
    get_stressed_area_portion_unweighted($1, $2) as "STRESSED_AREA_PORTION"
    `,
      [geoRegionId, nameCode],
    );

    return res[0];
  }

  /**
   * @description: This is a quick and dirty approach given the time constraints. I am making a huge assumption that usually we won't be missing production data
   *               so that we compute the distributed impact only for those locations with missing production data.
   *               Depending on how often this might happen, it would be better to compute it at DB level for all raw impact, but that would
   *               add a lot of time complexity to the process.
   */
  async updateDistributedImpactOverGeoRegion(
    data: SourcingRecordsWithIndicatorRawData[],
    activeIndicators: Indicator[],
  ): Promise<SourcingRecordsWithIndicatorRawData[]> {
    // Map to group records by location. This is important as production/harvest is computed at location level, not record
    // otherwise we would have to compute it for each record to get the same value redundantly
    const recordsPorLocation: Map<
      string,
      SourcingRecordsWithIndicatorRawData[]
    > = new Map<string, SourcingRecordsWithIndicatorRawData[]>();
    const repository = this.dataSource.getRepository(SourcingLocation);
    // For testing purposes, track locations with no production in task, will remove this later
    const locationIdsWithNoProduction: string[] = [];

    const INDICATORS_TO_CALCULATE_DISTRIBUTED_IMPACT: INDICATOR_NAME_CODES[] = [
      INDICATOR_NAME_CODES.UWU,
      INDICATOR_NAME_CODES.ENL,
      INDICATOR_NAME_CODES.WGSWU_NEW,
    ];

    const filteredIndicators = activeIndicators.filter((indicator: Indicator) =>
      INDICATORS_TO_CALCULATE_DISTRIBUTED_IMPACT.includes(indicator.nameCode),
    );

    // Group records by location where production is 0 or null
    // TODO: We must apply this when harvesting is 0 as well, but given the use of this approach is not straightforward, and how to apply the new values
    //       might change based on the indicator, double check this.
    for (const record of data) {
      if (!record.production || record.production === 0) {
        if (!recordsPorLocation.has(record.sourcingLocationId)) {
          recordsPorLocation.set(record.sourcingLocationId, []);
          locationIdsWithNoProduction.push(record.sourcingLocationId);
        }
        recordsPorLocation.get(record.sourcingLocationId)!.push(record);
      }
    }
    if (locationIdsWithNoProduction.length) {
      this.logger.warn(
        `Locations with no production: ${locationIdsWithNoProduction.join(
          ', ',
        )}`,
      );
    }
    const dataArray = Array.from(recordsPorLocation.entries());
    const promises: Promise<any>[] = dataArray.map(async (elem) => {
      // For each location that has no production value, get its geo region
      const [sourcingLocationId, records] = elem;
      const { geoRegionId } = await repository.findOneOrFail({
        where: { id: sourcingLocationId },
      });
      const distributedImpact: Record<INDICATOR_NAME_CODES, number> = {} as any;
      const WGSWU_NEW_distributedImpact = {
        BWS_IN_STRESSED_AREAS: 0,
        STRESSED_AREA_PORTION: 0,
      };
      // For each location that has no production value, compute the distributed impact for each active indicator
      // at the time being, I don't know if all indicator will need a distributed impact in case of missing production, clarify this
      for (const indicator of filteredIndicators) {
        // Since the approach for this indicator is so far unique based on our current pattern, we apply a different logic
        if (indicator.nameCode === INDICATOR_NAME_CODES.WGSWU_NEW) {
          const { BWS_IN_STRESSED_AREAS, STRESSED_AREA_PORTION } =
            await this.getDistributedImpactForWGSWU_NEW(geoRegionId);
          WGSWU_NEW_distributedImpact.BWS_IN_STRESSED_AREAS =
            BWS_IN_STRESSED_AREAS;
          WGSWU_NEW_distributedImpact.STRESSED_AREA_PORTION =
            STRESSED_AREA_PORTION;
        }
        distributedImpact[indicator.nameCode] =
          await this.getDistributedImpactOverGeoRegion(
            geoRegionId,
            indicator.nameCode,
          );
      }
      // Update the records with the distributed impact
      records.forEach((record) => {
        record.distributedImpact = distributedImpact;
        record.BWS_IN_STRESSED_AREAS =
          WGSWU_NEW_distributedImpact.BWS_IN_STRESSED_AREAS;
        record.STRESSED_AREA_PORTION =
          WGSWU_NEW_distributedImpact.STRESSED_AREA_PORTION;
      });
    });

    await Promise.all(promises);
    return data;
  }
}
