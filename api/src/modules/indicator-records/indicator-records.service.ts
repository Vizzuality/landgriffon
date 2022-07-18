import { Injectable, NotFoundException } from '@nestjs/common';
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
import { InjectRepository } from '@nestjs/typeorm';
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
import * as config from 'config';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import { SourcingRecordDataForImpact } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { IndicatorRecordCalculatedValuesDto } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';
import { IndicatorNameCodeWithRelatedH3 } from 'modules/indicators/dto/indicator-namecode-with-related-h3.dto';
import { IndicatorComputedRawDataDto } from 'modules/indicators/dto/indicator-computed-raw-data.dto';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';

@Injectable()
export class IndicatorRecordsService extends AppBaseService<
  IndicatorRecord,
  CreateIndicatorRecordDto,
  UpdateIndicatorRecordDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(IndicatorRecordRepository)
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly indicatorService: IndicatorsService,
    private readonly h3DataService: H3DataService,
    private readonly materialsToH3sService: MaterialsToH3sService,
    private readonly h3DataYearsService: H3DataYearsService,
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

  private async getH3DataForSourcingRecord(
    sourcingRecord: SourcingRecordDataForImpact,
    type: MATERIAL_TO_H3_TYPE,
  ): Promise<H3Data | null> {
    let h3Table: H3Data | undefined =
      await this.materialsToH3sService.findH3DataForMaterial({
        materialId: sourcingRecord.materialId,
        year: sourcingRecord.year,
        type,
      });

    if (h3Table) {
      return h3Table;
    }

    switch (config.get('import.missingDataFallbackStrategy')) {
      case 'ignore':
        this.logger.log(
          `Cannot calculate impact for sourcing record - missing ${type} h3 data for material with ID "${sourcingRecord.materialId}" and year "${sourcingRecord.year}". Ignoring souring record`,
        );
        return null;
        break;
      case 'fallback':
        this.logger.debug(
          `Missing ${type} h3 data for material with ID "${sourcingRecord.materialId}" and year "${sourcingRecord.year}". Falling back to different year`,
        );
        const h3DataYearToApply: number | undefined =
          await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
            sourcingRecord.materialId,
            type,
            sourcingRecord.year,
          );
        h3Table = await this.materialsToH3sService.findH3DataForMaterial({
          materialId: sourcingRecord.materialId,
          year: h3DataYearToApply,
          type,
        });
        if (!h3Table) {
          throw new MissingH3DataError(
            `Cannot calculate impact for sourcing record - missing ${type} h3 data for material with ID "${sourcingRecord.materialId}" with year fallback strategy`,
          );
        }
        return h3Table;
        break;
      case 'error':
        throw new MissingH3DataError(
          `Cannot calculate impact for sourcing record - missing ${type} h3 data for material with ID "${sourcingRecord.materialId}" and year "${sourcingRecord.year}"`,
        );
      default:
        throw new Error(
          `Invalid missingDataFallbackStrategy strategy "${config.get(
            'import.missingDataFallbackStrategy',
          )}"`,
        );
    }
  }

  async getIndicatorRecordById(id: number): Promise<IndicatorRecord> {
    const found: IndicatorRecord | undefined =
      await this.indicatorRecordRepository.findOne(id);
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
  async createIndicatorRecordsForAllSourcingRecords(): Promise<void> {
    const rawData: SourcingRecordsWithIndicatorRawDataDto[] =
      await this.indicatorRecordRepository.getIndicatorRawDataForAllSourcingRecords();
    const calculatedData: IndicatorRecordCalculatedValuesDto[] = rawData.map(
      (sourcingRecordData: SourcingRecordsWithIndicatorRawDataDto) =>
        this.calculateIndicatorValues(sourcingRecordData),
    );
    const indicatorMap: Record<string, any> = await this.getIndicatorMap();
    const indicatorRecords: IndicatorRecord[] = [];
    calculatedData.forEach(
      (calculatedIndicatorRecords: IndicatorRecordCalculatedValuesDto) => {
        const indicatorRecordDeforestation: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords.values.get(
              INDICATOR_TYPES.DEFORESTATION,
            ),
            indicatorId: indicatorMap[INDICATOR_TYPES.DEFORESTATION].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId: calculatedIndicatorRecords.materialH3DataId,
          });
        const indicatorRecordBiodiversity: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords.values.get(
              INDICATOR_TYPES.BIODIVERSITY_LOSS,
            ),
            indicatorId: indicatorMap[INDICATOR_TYPES.BIODIVERSITY_LOSS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId: calculatedIndicatorRecords.materialH3DataId,
          });
        const indicatorRecordCarbonEmissions: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords.values.get(
              INDICATOR_TYPES.CARBON_EMISSIONS,
            ),
            indicatorId: indicatorMap[INDICATOR_TYPES.CARBON_EMISSIONS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId: calculatedIndicatorRecords.materialH3DataId,
          });
        const indicatorRecordUnsustainableWater: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords.values.get(
              INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
            ),
            indicatorId:
              indicatorMap[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId: calculatedIndicatorRecords.materialH3DataId,
          });
        indicatorRecords.push(
          indicatorRecordDeforestation,
          indicatorRecordBiodiversity,
          indicatorRecordCarbonEmissions,
          indicatorRecordUnsustainableWater,
        );
      },
    );
    await this.indicatorRecordRepository.saveChunks(indicatorRecords);
  }

  /**
   * @description Creates Indicator-Records for a single Sourcing-Record, by first retrieving Raw Indicator data from the DB, then applying
   * the methodology and persist new Indicator Records
   */
  async createIndicatorRecordsBySourcingRecords(
    sourcingData: {
      sourcingRecordId: string;
      geoRegionId: string;
      materialId: string;
      tonnage: number;
      year: number;
    },
    providedCoefficients?: IndicatorCoefficientsDto,
  ): Promise<IndicatorRecord[]> {
    // TODO: This Harvest Material reference is stored later in the Indicator Record in order to optimize queries regarding
    // maps, because, so far, all indicator use it for their calculations. Will potentially need to be reworked
    // as more indicators with different formulas are introduced
    const materialH3Data: H3Data | undefined =
      await this.h3DataService.getMaterialH3ByClosestYear(
        sourcingData.materialId,
        MATERIAL_TO_H3_TYPE.HARVEST,
        sourcingData.year,
      );

    if (!materialH3Data) {
      throw new MissingH3DataError(
        `No H3 Data required to calculate Impact for Material with ID: ${sourcingData.materialId}`,
      );
    }

    const indicators: Indicator[] =
      await this.indicatorService.getAllIndicators();

    let calculatedIndicatorRecordValues: IndicatorRecordCalculatedValuesDto;
    if (providedCoefficients) {
      calculatedIndicatorRecordValues = this.useProvidedIndicatorCoefficients(
        providedCoefficients,
        sourcingData,
        indicators,
        materialH3Data.id,
      );
    } else {
      const rawData: IndicatorComputedRawDataDto =
        await this.getIndicatorRawDataByGeoRegionAndMaterial(
          sourcingData.geoRegionId,
          sourcingData.materialId,
          sourcingData.year,
        );
      calculatedIndicatorRecordValues = this.calculateIndicatorValuesV2(
        sourcingData.sourcingRecordId,
        sourcingData.tonnage,
        materialH3Data.id,
        rawData,
      );
    }

    // Create the Indicator Records entities from the calculated indicator values
    const indicatorRecords: IndicatorRecord[] = indicators.map(
      (indicator: Indicator) => {
        return IndicatorRecordsService.createIndicatorRecord(
          indicator,
          calculatedIndicatorRecordValues,
        );
      },
    );

    return this.indicatorRecordRepository.save(indicatorRecords);
  }

  /**
   * Creates an IndicatorRecord object instance from the given input (type, calculated values, and h3data)
   * @param indicator
   * @param calculatedValues
   * @private
   */
  private static createIndicatorRecord(
    indicator: Indicator,
    calculatedValues: IndicatorRecordCalculatedValuesDto,
  ): IndicatorRecord {
    return IndicatorRecord.merge(new IndicatorRecord(), {
      value: calculatedValues.values.get(indicator.nameCode as INDICATOR_TYPES),
      indicatorId: indicator.id,
      status: INDICATOR_RECORD_STATUS.SUCCESS,
      sourcingRecordId: calculatedValues.sourcingRecordId,
      scaler: calculatedValues.production,
      materialH3DataId: calculatedValues.materialH3DataId,
    });
  }

  /**
   * @description Consumes Indicator Raw Data from the DB to calculate final values for Indicator Records
   */
  // TODO: Extract the logic of equaling to 0 all falsy values to some other place
  // TODO: Although refactored, this is kept for compatibility with the calculation of all sourcing records on sourcing import
  private calculateIndicatorValues(
    sourcingRecordData: SourcingRecordsWithIndicatorRawDataDto,
  ): IndicatorRecordCalculatedValuesDto {
    const {
      sourcingRecordId,
      tonnage,
      production,
      harvestedArea,
      materialH3DataId,
    } = sourcingRecordData;

    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();

    // TODO Alternative strategy for calculations when production and harvest area values are very small

    /** Temporary solution - checking if production and harvest area values are less than 1
     *  the raw impact values and land use values will be set to 0
     */
    const deforestationPerHarvestedAreaLandUse: number =
      harvestedArea < 1
        ? 0
        : sourcingRecordData.rawDeforestation / harvestedArea || 0;
    const biodiversityLossPerHarvestedAreaLandUse: number =
      harvestedArea < 1
        ? 0
        : sourcingRecordData.rawBiodiversity / harvestedArea || 0;
    const carbonLossPerHarvestedAreaLandUse: number =
      harvestedArea < 1 ? 0 : sourcingRecordData.rawCarbon / harvestedArea || 0;

    calculatedIndicatorValues.sourcingRecordId = sourcingRecordId;
    calculatedIndicatorValues.materialH3DataId = materialH3DataId;
    calculatedIndicatorValues.production = production;
    // Land per tonn is set to 0 if production or harvest area are less than 1
    calculatedIndicatorValues.landPerTon =
      harvestedArea < 1 || production < 1 ? 0 : harvestedArea / production || 0;
    const landUse: number = calculatedIndicatorValues.landPerTon * tonnage || 0;
    calculatedIndicatorValues.landUse = landUse;

    calculatedIndicatorValues.values = new Map();
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES.DEFORESTATION,
      deforestationPerHarvestedAreaLandUse * landUse,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES.BIODIVERSITY_LOSS,
      biodiversityLossPerHarvestedAreaLandUse * landUse,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES.CARBON_EMISSIONS,
      carbonLossPerHarvestedAreaLandUse * landUse,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      sourcingRecordData.rawWater * tonnage,
    );

    return calculatedIndicatorValues;
  }

  /**
   * Consumes Indicator Raw Data from the DB to calculate final values for Indicator Records
   * @param sourcingRecordId
   * @param tonnage
   * @param materialH3DataId
   * @param indicatorComputedRawData
   * @private
   */
  private calculateIndicatorValuesV2(
    sourcingRecordId: string,
    tonnage: number,
    materialH3DataId: string,
    indicatorComputedRawData: IndicatorComputedRawDataDto,
  ): IndicatorRecordCalculatedValuesDto {
    const { production, harvestedArea } = indicatorComputedRawData;
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();

    // TODO Alternative strategy for calculations when production and harvest area values are very small

    /** Temporary solution - checking if production and harvest area values are less than 1
     *  the raw impact values and land use values will be set to 0
     */

    calculatedIndicatorValues.sourcingRecordId = sourcingRecordId;
    calculatedIndicatorValues.materialH3DataId = materialH3DataId;
    calculatedIndicatorValues.production = production;
    // Land per tonn is set to 0 if production or harvest area are less than 1
    calculatedIndicatorValues.landPerTon =
      harvestedArea < 1 || production < 1 ? 0 : harvestedArea / production || 0;
    const landUse: number = calculatedIndicatorValues.landPerTon * tonnage || 0;
    calculatedIndicatorValues.landUse = landUse;

    //calculate final value for each indicator raw value included in indicatorComputedRawData
    calculatedIndicatorValues.values = new Map();
    indicatorComputedRawData.indicatorValues.forEach(
      (value: number, indicatorType: INDICATOR_TYPES) => {
        //TODO provisional simple version, might need refactoring to strategy pattern as indicators expand
        if (indicatorType === INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE) {
          calculatedIndicatorValues.values.set(indicatorType, value * tonnage);
        } else {
          // Impact value is set to 0 if harvest area are less than 1
          const indicatorPerHarvestedAreaLandUse: number =
            harvestedArea < 1 ? 0 : value / harvestedArea || 0;
          calculatedIndicatorValues.values.set(
            indicatorType,
            indicatorPerHarvestedAreaLandUse * landUse,
          );
        }
      },
    );

    return calculatedIndicatorValues;
  }

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
  private useProvidedIndicatorCoefficients(
    newIndicatorCoefficients: IndicatorCoefficientsDto,
    sourcingData: { sourcingRecordId: string; tonnage: number },
    indicators: Indicator[],
    materialH3DataId: string,
  ): IndicatorRecordCalculatedValuesDto {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();
    calculatedIndicatorValues.sourcingRecordId = sourcingData.sourcingRecordId;
    calculatedIndicatorValues.materialH3DataId = materialH3DataId;
    calculatedIndicatorValues.values = new Map();

    for (const indicator of indicators) {
      const type: INDICATOR_TYPES = indicator.nameCode as INDICATOR_TYPES;
      if (!newIndicatorCoefficients[type]) {
        throw new NotFoundException(
          `Required coefficient for indicator ${type} was not provided`,
        );
      }

      const value: number =
        newIndicatorCoefficients[type] * sourcingData.tonnage;
      calculatedIndicatorValues.values.set(type, value);
    }
    return calculatedIndicatorValues;
  }

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
        await this.indicatorRecordRepository.getH3SumOverGeoRegionSQL(
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
        await this.indicatorRecordRepository.getIndicatorRecordRawValue(
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
}
