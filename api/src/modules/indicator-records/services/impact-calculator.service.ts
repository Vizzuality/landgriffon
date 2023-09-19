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
import { EntityToH3 } from 'modules/h3-data/entity-to-h3.entity';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { IndicatorRecordCalculatedValuesDto } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';
import { MaterialsToH3sService } from 'modules/h3-data/materials-to-h3s.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { IndicatorQueryDependencyManager } from 'modules/indicator-records/services/indicator-dependency-manager.service';
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
  rawData: SourcingRecordsWithIndicatorRawData;
}

@Injectable()
export class ImpactCalculator {
  logger: Logger = new Logger(ImpactCalculator.name);

  constructor(
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly materialToH3: MaterialsToH3sService,
    private readonly indicatorService: IndicatorsService,
    private readonly dependencyManager: IndicatorQueryDependencyManager,
    private readonly h3DataService: H3DataService,
    private readonly cachedDataService: CachedDataService,
    private readonly dataSource: DataSource,
  ) {}

  async calculateImpactForAllSourcingRecords(
    activeIndicators: Indicator[],
  ): Promise<void> {
    const rawData: SourcingRecordsWithIndicatorRawData[] =
      await this.getImpactRawDataForAllSourcingRecords(activeIndicators);

    const newImpactToBeSaved: IndicatorRecord[] = [];

    rawData.forEach((data: SourcingRecordsWithIndicatorRawData) => {
      const indicatorValues: Map<INDICATOR_NAME_CODES, number> =
        this.calculateIndicatorValues(data, data.tonnage);

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
    const materialH3s: EntityToH3 | null = await this.materialToH3.findOne({
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

      calculatedIndicatorRecordValues.values = this.calculateIndicatorValues(
        rawData,
        sourcingData.tonnage,
      );
    }

    indicatorsToCalculateImpactFor.forEach((indicator: Indicator) => {
      indicatorRecords.push(
        IndicatorRecord.merge(new IndicatorRecord(), {
          value: calculatedIndicatorRecordValues.values.get(
            indicator.nameCode as INDICATOR_NAME_CODES,
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
    calculatedIndicatorValues.values.set(
      INDICATOR_NAME_CODES.LAND_USE,
      newIndicatorCoefficients[INDICATOR_NAME_CODES.LAND_USE] *
        sourcingData.tonnage || 0,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      newIndicatorCoefficients[INDICATOR_NAME_CODES.DEFORESTATION_RISK] *
        sourcingData.tonnage || 0,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_NAME_CODES.CLIMATE_RISK,
      newIndicatorCoefficients[INDICATOR_NAME_CODES.CLIMATE_RISK] *
        sourcingData.tonnage || 0,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_NAME_CODES.WATER_USE,
      newIndicatorCoefficients[INDICATOR_NAME_CODES.WATER_USE] *
        sourcingData.tonnage || 0,
    );

    // TODO: We need to ignore satelligence indicators from being affected by a coefficient that a user can send
    //       updating the model will be required for this, as by default any indicator that is active will be shown
    //       in the UI, also for sending coefficients in intervention calculation

    // Depends on water use indicator's final value
    const waterUseValue: number = calculatedIndicatorValues.values.get(
      INDICATOR_NAME_CODES.WATER_USE,
    )!;
    calculatedIndicatorValues.values.set(
      INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE,
      waterUseValue *
        newIndicatorCoefficients[INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE] *
        sourcingData.tonnage,
    );

    return calculatedIndicatorValues;
  }

  private requiresNewProductionValue(sourcingRecord?: SourcingRecord): boolean {
    return !sourcingRecord || !sourcingRecord.indicatorRecords;
  }

  private calculateIndicatorValues(
    rawData: SourcingRecordsWithIndicatorRawData,
    tonnage: number,
  ): Map<INDICATOR_NAME_CODES, number> {
    const landPerTon: number = Number.isFinite(
      rawData.harvest / rawData.production,
    )
      ? rawData.harvest / rawData.production
      : 0;
    const landUse: number = landPerTon * tonnage;
    const deforestationPreProcessed: number = Number.isFinite(
      rawData.rawDeforestation / rawData.production,
    )
      ? rawData.rawDeforestation / rawData.production
      : 0;
    const deforestation: number =
      deforestationPreProcessed > 0 ? deforestationPreProcessed * landUse : 0;
    const climateRiskPreProcessed: number = Number.isFinite(
      rawData.rawClimateRisk / rawData.production,
    )
      ? rawData.rawClimateRisk / rawData.production
      : 0;
    const climateRisk: number =
      climateRiskPreProcessed > 0 ? climateRiskPreProcessed * landUse : 0;
    const naturalRiskPreprocessed: number = Number.isFinite(
      rawData.rawNaturalConversion / rawData.production,
    )
      ? rawData.rawNaturalConversion / rawData.production
      : 0;
    const naturalRisk: number =
      naturalRiskPreprocessed > 0 ? naturalRiskPreprocessed * landUse : 0;
    const waterUse: number = rawData.rawWaterUse * tonnage;
    const unsustainableWaterUse: number =
      waterUse * rawData.rawUnsustainableWaterUse;
    const waterQuality: number = rawData.rawWaterQuality * tonnage;

    const map: Map<INDICATOR_NAME_CODES, number> = new Map();
    map.set(INDICATOR_NAME_CODES.DEFORESTATION_RISK, deforestation);
    map.set(INDICATOR_NAME_CODES.CLIMATE_RISK, climateRisk);
    map.set(
      INDICATOR_NAME_CODES.NATURAL_ECOSYSTEM_CONVERSION_RISK,
      naturalRisk,
    );
    map.set(
      INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE,
      unsustainableWaterUse,
    );
    map.set(INDICATOR_NAME_CODES.WATER_USE, waterUse);
    map.set(INDICATOR_NAME_CODES.WATER_QUALITY, waterQuality);
    map.set(INDICATOR_NAME_CODES.LAND_USE, landUse);
    map.set(
      INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION,
      rawData.satDeforestation,
    );
    map.set(
      INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION_RISK,
      rawData.satDeforestationRisk,
    );

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
