import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import {
  IndicatorRawDataBySourcingRecord,
  SourcingRecordsWithIndicatorRawDataDtoV2,
} from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES_NEW,
} from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from 'modules/indicator-records/indicator-record.entity';
import { IndicatorCoefficientsDtoV2 } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { IndicatorRecordCalculatedValuesDtoV2 } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { IndicatorDependencyManager } from 'modules/indicator-records/services/indicator-dependency-manager.service';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import {
  CACHED_DATA_TYPE,
  CachedData,
} from 'modules/cached-data/cached-data.entity';

/**
 * @description: This is PoC (Proof of Concept) for the updated LG methodology v0.1
 *               Needs to be properly implemented (following the current methodology pattern)
 *               as soon as results are validated
 */

export interface CachedRawData {
  rawData: IndicatorRawDataBySourcingRecord;
}

@Injectable()
export class ImpactCalculator {
  logger: Logger = new Logger(ImpactCalculator.name);

  constructor(
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly materialToH3: MaterialsToH3sService,
    private readonly indicatorService: IndicatorsService,
    private readonly dependencyManager: IndicatorDependencyManager,
    private readonly h3DataService: H3DataService,
    private readonly cachedDataService: CachedDataService,
    private readonly dataSource: DataSource,
  ) {}

  async calculateImpactForAllSourcingRecords(
    activeIndicators: Indicator[],
  ): Promise<any> {
    const rawData: SourcingRecordsWithIndicatorRawDataDtoV2[] =
      await this.getIndicatorRawDataForAllSourcingRecordsV2(activeIndicators);

    const newImpactToBeSaved: IndicatorRecord[] = [];

    rawData.forEach((data: SourcingRecordsWithIndicatorRawDataDtoV2) => {
      const indicatorValues: Map<INDICATOR_TYPES_NEW, number> =
        this.calculateIndicatorValues(data, data.tonnage);

      activeIndicators.forEach((indicator: Indicator) => {
        newImpactToBeSaved.push(
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: indicatorValues.get(
              indicator.nameCode as INDICATOR_TYPES_NEW,
            ),
            indicatorId: indicator.id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: data.sourcingRecordId,
            scaler: data.production,
            materialH3DataId: data.materialH3DataId,
          }),
        );
      });
    });

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
    providedCoefficients?: IndicatorCoefficientsDtoV2,
  ): Promise<any> {
    const {
      geoRegionId,
      materialId,
      adminRegionId,
      tonnage,
      sourcingRecordId,
    } = sourcingData;

    let calculatedIndicatorRecordValues: IndicatorRecordCalculatedValuesDtoV2;
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
    let rawData: IndicatorRawDataBySourcingRecord =
      new IndicatorRawDataBySourcingRecord();

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
          (i: Indicator) => i.nameCode as INDICATOR_TYPES_NEW,
        ),
        materialId,
        geoRegionId,
        adminRegionId,
      );

      calculatedIndicatorRecordValues =
        new IndicatorRecordCalculatedValuesDtoV2();

      calculatedIndicatorRecordValues.values = this.calculateIndicatorValues(
        rawData,
        sourcingData.tonnage,
      );
    }

    indicatorsToCalculateImpactFor.forEach((indicator: Indicator) => {
      indicatorRecords.push(
        IndicatorRecord.merge(new IndicatorRecord(), {
          value: calculatedIndicatorRecordValues.values.get(
            indicator.nameCode as INDICATOR_TYPES_NEW,
          ),
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
    indicators: INDICATOR_TYPES_NEW[],
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): Promise<IndicatorRawDataBySourcingRecord> {
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
    indicators: INDICATOR_TYPES_NEW[],
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): Promise<IndicatorRawDataBySourcingRecord> {
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
    newIndicatorCoefficients: IndicatorCoefficientsDtoV2,
    sourcingData: { sourcingRecordId: string; tonnage: number },
    materialH3DataId: string,
  ): IndicatorRecordCalculatedValuesDtoV2 {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDtoV2 =
      new IndicatorRecordCalculatedValuesDtoV2();
    calculatedIndicatorValues.sourcingRecordId = sourcingData.sourcingRecordId;
    calculatedIndicatorValues.materialH3DataId = materialH3DataId;
    calculatedIndicatorValues.values = new Map<INDICATOR_TYPES_NEW, number>();
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.LAND_USE,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.LAND_USE] *
        sourcingData.tonnage || 0,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.DEFORESTATION_RISK] *
        sourcingData.tonnage || 0,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.CLIMATE_RISK,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.CLIMATE_RISK] *
        sourcingData.tonnage || 0,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.WATER_USE,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.WATER_USE] *
        sourcingData.tonnage || 0,
    );

    // TODO: We need to ignore satelligence indicators from being affected by a coefficient that a user can send
    //       updating the model will be required for this, as by default any indicator that is active will be shown
    //       in the UI, also for sending coefficients in intervention calculation

    // Depends on water use indicator's final value
    const waterUseValue: number = calculatedIndicatorValues.values.get(
      INDICATOR_TYPES_NEW.WATER_USE,
    )!;
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
      waterUseValue *
        newIndicatorCoefficients[INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE] *
        sourcingData.tonnage,
    );

    return calculatedIndicatorValues;
  }

  private requiresNewProductionValue(sourcingRecord?: SourcingRecord): boolean {
    return !sourcingRecord || !sourcingRecord.indicatorRecords;
  }

  private calculateIndicatorValues(
    rawData:
      | SourcingRecordsWithIndicatorRawDataDtoV2
      | IndicatorRawDataBySourcingRecord,
    tonnage: number,
  ): Map<INDICATOR_TYPES_NEW, number> {
    const landPerTon: number = Number.isFinite(
      rawData.harvestedArea / rawData.production,
    )
      ? rawData.harvestedArea / rawData.production
      : 0;
    const weightedTotalCropLandArea: number = Number.isFinite(
      rawData.weightedAllHarvest / rawData.production,
    )
      ? rawData.weightedAllHarvest / rawData.production
      : 0;
    const deforestationPerHarvestLandUse: number =
      weightedTotalCropLandArea > 0
        ? rawData.rawDeforestation / weightedTotalCropLandArea
        : 0;
    const carbonPerHarvestLandUse: number =
      weightedTotalCropLandArea > 0
        ? rawData.rawCarbon / weightedTotalCropLandArea
        : 0;
    const landUse: number = landPerTon * tonnage;
    const deforestation: number = deforestationPerHarvestLandUse * landUse;
    const carbonLoss: number = carbonPerHarvestLandUse * landUse;
    const waterUse: number = rawData.rawWater * tonnage;
    const unsustainableWaterUse: number = waterUse * rawData.waterStressPerct;

    const map: Map<INDICATOR_TYPES_NEW, number> = new Map();
    map.set(INDICATOR_TYPES_NEW.CLIMATE_RISK, carbonLoss);
    map.set(INDICATOR_TYPES_NEW.DEFORESTATION_RISK, deforestation);
    map.set(INDICATOR_TYPES_NEW.WATER_USE, waterUse);
    map.set(INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE, unsustainableWaterUse);
    map.set(INDICATOR_TYPES_NEW.LAND_USE, landUse);
    map.set(
      INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION,
      rawData.satDeforestation,
    );
    map.set(
      INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION_RISK,
      rawData.satDeforestationRisk,
    );

    return map;
  }

  private generateIndicatorCalculationCacheKey(
    indicators: INDICATOR_TYPES_NEW[],
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): any {
    return {
      // Sort the indicator list to guarantee that the same set of indicator types won't result in different keys
      // because of their order
      indicators: indicators.sort(
        (a: INDICATOR_TYPES_NEW, b: INDICATOR_TYPES_NEW) =>
          a.toString() > b.toString() ? -1 : 1,
      ),
      materialId,
      geoRegionId,
      adminRegionId,
    };
  }

  async getIndicatorRawDataForAllSourcingRecordsV2(
    activeIndicators: Indicator[],
  ): Promise<SourcingRecordsWithIndicatorRawDataDtoV2[]> {
    const { params, query } = this.dependencyManager.buildQueryForImport(
      activeIndicators.map(
        (indicator: Indicator) => indicator.nameCode as INDICATOR_TYPES_NEW,
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
          distinct on (sr.id)
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
                      sourcing_location.id,
                      "scenarioInterventionId",
                      "interventionType",
                      mth."h3DataId" as "materialH3DataId",
                      ${query}

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
}
