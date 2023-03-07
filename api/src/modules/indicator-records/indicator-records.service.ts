import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
  indicatorRecordResource,
} from 'modules/indicator-records/indicator-record.entity';
import { CreateIndicatorRecordDto } from 'modules/indicator-records/dto/create.indicator-record.dto';
import { UpdateIndicatorRecordDto } from 'modules/indicator-records/dto/update.indicator-record.dto';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { IndicatorRecordCalculatedValuesDto } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';
import { IndicatorNameCodeWithRelatedH3 } from 'modules/indicators/dto/indicator-namecode-with-related-h3.dto';
import { IndicatorComputedRawDataDto } from 'modules/indicators/dto/indicator-computed-raw-data.dto';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import {
  CACHED_DATA_TYPE,
  CachedData,
} from 'modules/cached-data/cached-data.entity';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IMPACT_VIEW_NAME } from 'modules/impact/views/impact.materialized-view.entity';
import { DataSource } from 'typeorm';

export interface CachedRawValue {
  rawValue: number;
}

@Injectable()
export class IndicatorRecordsService extends AppBaseService<
  IndicatorRecord,
  CreateIndicatorRecordDto,
  UpdateIndicatorRecordDto,
  AppInfoDTO
> {
  constructor(
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly indicatorService: IndicatorsService,
    private readonly impactCalculator: ImpactCalculator,
    private readonly h3DataService: H3DataService,
    private readonly materialsToH3sService: MaterialsToH3sService,
    private readonly h3DataYearsService: H3DataYearsService,
    private readonly cachedDataService: CachedDataService,
    private readonly dataSource: DataSource,
  ) {
    super(
      indicatorRecordRepository,
      indicatorRecordResource.name.singular,
      indicatorRecordResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<IndicatorRecord> {
    return {
      attributes: [
        'value',
        'status',
        'statusMsg',
        'createdAt',
        'updatedAt',
        'indicatorId',
        'indicatorCoefficientId',
        'sourcingRecordId',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getIndicatorRecordById(id: string): Promise<IndicatorRecord> {
    const found: IndicatorRecord | null =
      await this.indicatorRecordRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(`Indicator Record with ID "${id}" not found`);
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.indicatorRecordRepository.delete({});
  }

  /**
   * @description Creates Indicator Records from all existing Sourcing Records in the DB
   */
  // TODO still not adapted to modular indicators, because the performance gets hit drastically on the source import. Pending to be worked on

  /**
   * @description Creates Indicator-Records for a single Sourcing-Record, by first retrieving Raw Indicator data from the DB, then applying
   * the methodology and persist new Indicator Records
   */

  /**
   * Creates an IndicatorRecord object instance from the given input (type, calculated values, and h3data)
   * @param indicator
   * @param calculatedValues
   * @private
   */

  /**
   * Consumes Indicator Raw Data from the DB to calculate final values for Indicator Records
   * @param sourcingRecordId
   * @param tonnage
   * @param materialH3DataId
   * @param indicatorComputedRawData
   * @private
   */

  // TODO: Check what is actually needed from this indicator mapper
  //       i.e bringing and relating H3 data is not
  /**
   * @description Get a Indicator Hashmap to relate Indicator Records with Indicators by the Name Code
   */
  async getIndicatorMap(): Promise<Record<string, any>> {
    const indicators: IndicatorNameCodeWithRelatedH3[] =
      await this.indicatorService.getIndicatorsAndRelatedH3DataIds();
    const indicatorMap: Record<string, any> = {};
    indicators.forEach(
      (indicator: { id: string; nameCode: string; h3DataId: string }) => {
        indicatorMap[indicator.nameCode] = indicator;
      },
    );
    return indicatorMap;
  }

  /**
   * @description: Calculates Indicator values by the tonnage of the impact and estimates (coefficients) provided
   * by the user, for each possible indicator passed in an array
   */

  async getIndicatorRawDataByGeoRegionAndMaterial(
    geoRegionId: string,
    materialId: string,
    year: number,
  ): Promise<IndicatorComputedRawDataDto> {
    // It is assumed that the indicators that enabled/valid, are the ones that are present on the DB since
    // the initial seeding import. So a simple getAll is sufficient
    const indicators: Indicator[] =
      await this.indicatorService.getAllIndicators();

    //load materials h3 data (producer and harvest)
    const materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data> =
      await this.h3DataService.getAllMaterialH3sByClosestYear(materialId, year);

    //Calculate material related values
    // TODO potential to change/refactor once there more types of material per H3
    const materialValues: Map<MATERIAL_TO_H3_TYPE, number> = new Map();

    for (const materialType of Object.values(MATERIAL_TO_H3_TYPE)) {
      const materialH3: H3Data | undefined = materialH3s.get(materialType);
      if (!materialH3) {
        throw new NotFoundException(
          `No H3 Data could be found the material ${materialId} type ${materialType}`,
        );
      }

      const value: number =
        //await this.indicatorRecordRepository.getH3SumOverGeoRegionSQL(
        await this.calculateRawMaterialValueOverGeoRegion(
          geoRegionId,
          materialH3,
        );

      materialValues.set(materialType, value);
    }

    //Calculate value for each indicator
    const indicatorValues: Map<INDICATOR_TYPES, number> = new Map();
    for (const indicator of indicators) {
      const indicatorDependencies: INDICATOR_TYPES[] =
        Indicator.getIndicatorCalculationDependencies(
          indicator.nameCode as INDICATOR_TYPES,
          true,
        );
      const indicatorH3s: Map<INDICATOR_TYPES, H3Data> =
        await this.h3DataService.getIndicatorH3sByTypeAndClosestYear(
          indicatorDependencies,
          year,
        );

      const impactRawValue: number =
        //await this.indicatorRecordRepository.getIndicatorRecordRawValue(
        await this.calculateRawIndicatorValueOverGeoRegion(
          geoRegionId,
          indicator.nameCode as INDICATOR_TYPES,
          indicatorH3s,
          materialH3s,
        );

      indicatorValues.set(
        indicator.nameCode as INDICATOR_TYPES,
        impactRawValue,
      );
    }

    return {
      production: materialValues.get(MATERIAL_TO_H3_TYPE.PRODUCER)!,
      harvestedArea: materialValues.get(MATERIAL_TO_H3_TYPE.HARVEST)!,
      indicatorValues: indicatorValues,
    };
  }

  /**
   * This functions calculates (or gets from the Cached Data if present) the material raw value
   * for the given material and geoRegion, and puts the result on the cache if needed.
   * @param geoRegionId
   * @param materialH3
   */
  async calculateRawMaterialValueOverGeoRegion(
    geoRegionId: string,
    materialH3: H3Data,
  ): Promise<number> {
    const cacheKey: any = this.generateMaterialCalculationCacheKey(
      geoRegionId,
      materialH3,
    );

    const cachedData: CachedData | null =
      await this.cachedDataService.getCachedDataByKey(
        cacheKey,
        CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      );

    if (cachedData) {
      return (cachedData.data as CachedRawValue).rawValue;
    }

    const cachedRawValue: CachedRawValue = {
      rawValue: await this.indicatorRecordRepository.getH3SumOverGeoRegionSQL(
        geoRegionId,
        materialH3,
      ),
    };

    await this.cachedDataService.createCachedData(
      cacheKey,
      cachedRawValue,
      CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
    );

    return cachedRawValue.rawValue;
  }

  /**
   * This functions calculates (or gets from the Cached Data if present) the indicator raw value
   * for the given indicators, material and geoRegion, and puts the result on the cache if needed.
   * @param geoRegionId
   * @param indicatorType
   * @param indicatorH3s
   * @param materialH3s
   */
  async calculateRawIndicatorValueOverGeoRegion(
    geoRegionId: string,
    indicatorType: INDICATOR_TYPES,
    indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
    materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  ): Promise<number> {
    const cacheKey: any = this.generateIndicatorCalculationCacheKey(
      geoRegionId,
      indicatorType,
      indicatorH3s,
      materialH3s,
    );

    const cachedData: CachedData | null =
      await this.cachedDataService.getCachedDataByKey(
        cacheKey,
        CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      );

    if (cachedData) {
      return (cachedData.data as CachedRawValue).rawValue;
    }

    const cachedRawValue: CachedRawValue = {
      rawValue: await this.indicatorRecordRepository.getIndicatorRecordRawValue(
        geoRegionId,
        indicatorType,
        indicatorH3s,
        materialH3s,
      ),
    };

    await this.cachedDataService.createCachedData(
      cacheKey,
      cachedRawValue,
      CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
    );

    return cachedRawValue.rawValue;
  }

  /// Calculation Cache related helpers
  /**
   * Creates a Material calculation cache key object, that will be used as the hashed for the cache
   * @param geoRegionId
   * @param materialH3
   * @private
   */
  private generateMaterialCalculationCacheKey(
    geoRegionId: string,
    materialH3: H3Data,
  ): any {
    return { geoRegionId, materialH3Id: materialH3.id };
  }

  /**
   * Creates a Indicator calculation cache key object, that will be used as the hashed for the cache
   * The object is simplified in order to avoid issues when hashing the key object
   * @param geoRegionId
   * @param indicatorType
   * @param indicatorH3s
   * @param materialH3s
   * @private
   */
  private generateIndicatorCalculationCacheKey(
    geoRegionId: string,
    indicatorType: INDICATOR_TYPES,
    indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
    materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  ): any {
    // Convert the maps to {type, id} objects
    const maoToMinifiedEntryArray = (
      map: Map<INDICATOR_TYPES | MATERIAL_TO_H3_TYPE, H3Data>,
    ): any => {
      return Array.from(map).map(
        (value: [INDICATOR_TYPES | MATERIAL_TO_H3_TYPE, H3Data]) => {
          return { type: value[0].toString(), id: value[1].id };
        },
      );
    };

    return {
      geoRegionId,
      indicatorType,
      indicatorH3Ids: maoToMinifiedEntryArray(indicatorH3s),
      materialH3Ids: maoToMinifiedEntryArray(materialH3s),
    };
  }

  async calculateImpactWithNewMethodology(
    activeIndicators: Indicator[],
  ): Promise<void> {
    return this.impactCalculator.calculateImpactForAllSourcingRecords(
      activeIndicators,
    );
  }

  async updateImpactView(): Promise<void> {
    return this.dataSource.query(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY ${IMPACT_VIEW_NAME} WITH DATA`,
    );
  }
}
