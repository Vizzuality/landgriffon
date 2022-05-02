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
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import * as config from 'config';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import {
  SourcingRecordDataForImpact,
  SourcingRecordsService,
} from 'modules/sourcing-records/sourcing-records.service';
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
    private readonly sourcingRecordsService: SourcingRecordsService,
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

  async createIndicatorRecordsForAllSourcingRecords(): Promise<void> {
    const rawData: SourcingRecordsWithIndicatorRawDataDto[] =
      await this.sourcingRecordsService.getSourcingRecordDataToCalculateIndicatorRecords();
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
            value: calculatedIndicatorRecords[INDICATOR_TYPES.DEFORESTATION],
            indicatorId: indicatorMap[INDICATOR_TYPES.DEFORESTATION].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId:
              indicatorMap[INDICATOR_TYPES.DEFORESTATION].h3DataId,
          });
        const indicatorRecordBiodiversity: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value:
              calculatedIndicatorRecords[INDICATOR_TYPES.BIODIVERSITY_LOSS],
            indicatorId: indicatorMap[INDICATOR_TYPES.BIODIVERSITY_LOSS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId:
              indicatorMap[INDICATOR_TYPES.BIODIVERSITY_LOSS].h3DataId,
          });
        const indicatorRecordCarbonEmissions: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords[INDICATOR_TYPES.CARBON_EMISSIONS],
            indicatorId: indicatorMap[INDICATOR_TYPES.CARBON_EMISSIONS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId:
              indicatorMap[INDICATOR_TYPES.CARBON_EMISSIONS].h3DataId,
          });
        const indicatorRecordUnsustainableWater: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value:
              calculatedIndicatorRecords[
                INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE
              ],
            indicatorId:
              indicatorMap[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            materialH3DataId:
              indicatorMap[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE].h3DataId,
          });
        indicatorRecords.push(
          indicatorRecordDeforestation,
          indicatorRecordBiodiversity,
          indicatorRecordCarbonEmissions,
          indicatorRecordUnsustainableWater,
        );
      },
    );
    await this.indicatorRecordRepository.save(indicatorRecords, {
      chunk: 1000,
    });
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
    },
    providedCoefficients?: IndicatorCoefficientsDto,
  ): Promise<IndicatorRecord[]> {
    const { geoRegionId, materialId } = sourcingData;
    let calculatedIndicatorRecordValues: IndicatorRecordCalculatedValuesDto;
    if (providedCoefficients) {
      calculatedIndicatorRecordValues = this.useProvidedIndicatorCoefficients(
        providedCoefficients,
        sourcingData,
      );
    } else {
      const rawData: IndicatorComputedRawDataDto =
        await this.indicatorRecordRepository.getIndicatorRawDataByGeoRegionAndMaterial(
          geoRegionId as string,
          materialId,
        );
      calculatedIndicatorRecordValues = this.calculateIndicatorValues({
        sourcingRecordId: sourcingData.sourcingRecordId,
        tonnage: sourcingData.tonnage,
        ...rawData,
      });
    }

    const materialH3Data: MaterialToH3 | undefined =
      await this.materialsToH3sService.findOne({ where: { materialId } });

    if (!materialH3Data) {
      throw new MissingH3DataError(
        `No H3 Data required for calculate Impact for Material with ID: ${materialId}`,
      );
    }

    // Create the Indicator Records entities from the calculated indicator values
    const indicatorMapper: Record<string, any> = await this.getIndicatorMap();
    const indicatorTypes: INDICATOR_TYPES[] = Object.values(INDICATOR_TYPES);
    const indicatorRecords: IndicatorRecord[] = indicatorTypes.map(
      (indicatorType: INDICATOR_TYPES) => {
        return IndicatorRecordsService.createIndicatorRecord(
          indicatorType,
          calculatedIndicatorRecordValues,
          materialH3Data.h3DataId,
          indicatorMapper,
        );
      },
    );

    return this.indicatorRecordRepository.save(indicatorRecords);
  }

  /**
   * Creates an IndicatorRecord object instance from the given input (type, calculated values, and h3data)
   * @param indicatorType
   * @param calculatedValues
   * @param materialH3dataId
   * @param indicatorMapper
   * @private
   */
  private static createIndicatorRecord(
    indicatorType: INDICATOR_TYPES,
    calculatedValues: IndicatorRecordCalculatedValuesDto,
    materialH3dataId: string,
    indicatorMapper: Record<string, any>,
  ): IndicatorRecord {
    return IndicatorRecord.merge(new IndicatorRecord(), {
      value: calculatedValues[indicatorType],
      indicatorId: indicatorMapper[indicatorType].id,
      status: INDICATOR_RECORD_STATUS.SUCCESS,
      sourcingRecordId: calculatedValues.sourcingRecordId,
      scaler: calculatedValues.production,
      materialH3DataId: materialH3dataId,
    });
  }

  /**
   * @description Consumes Indicator Raw Data from the DB to calculate final values for Indicator Records
   */

  // TODO: Extract the logic of equaling to 0 all falsy values to some other place

  private calculateIndicatorValues(
    sourcingRecordData: IndicatorComputedRawDataDto & {
      sourcingRecordId: string;
      tonnage: number;
    },
  ): IndicatorRecordCalculatedValuesDto {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();
    calculatedIndicatorValues.sourcingRecordId =
      sourcingRecordData.sourcingRecordId;
    calculatedIndicatorValues.production = sourcingRecordData.production;
    calculatedIndicatorValues.landPerTon =
      sourcingRecordData.harvestedArea / sourcingRecordData.production || 0;
    calculatedIndicatorValues.deforestationPerHarvestedAreaLandUse =
      sourcingRecordData.rawDeforestation / sourcingRecordData.harvestedArea ||
      0;
    calculatedIndicatorValues.biodiversityLossPerHarvestedAreaLandUse =
      sourcingRecordData.rawBiodiversity / sourcingRecordData.harvestedArea ||
      0;
    calculatedIndicatorValues.carbonLossPerHarvestedAreaLandUse =
      sourcingRecordData.rawCarbon / sourcingRecordData.harvestedArea || 0;
    calculatedIndicatorValues.landUse =
      calculatedIndicatorValues.landPerTon * sourcingRecordData.tonnage || 0;

    calculatedIndicatorValues[INDICATOR_TYPES.DEFORESTATION] =
      calculatedIndicatorValues.deforestationPerHarvestedAreaLandUse *
      calculatedIndicatorValues.landUse;
    calculatedIndicatorValues[INDICATOR_TYPES.BIODIVERSITY_LOSS] =
      calculatedIndicatorValues.biodiversityLossPerHarvestedAreaLandUse *
      calculatedIndicatorValues.landUse;
    calculatedIndicatorValues[INDICATOR_TYPES.CARBON_EMISSIONS] =
      calculatedIndicatorValues.carbonLossPerHarvestedAreaLandUse *
      calculatedIndicatorValues.landUse;
    calculatedIndicatorValues[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE] =
      sourcingRecordData.rawWater * sourcingRecordData.tonnage;

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
   * by the user
   */
  useProvidedIndicatorCoefficients(
    newIndicatorCoefficients: IndicatorCoefficientsDto,
    sourcingData: { sourcingRecordId: string; tonnage: number },
  ): IndicatorRecordCalculatedValuesDto {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();
    calculatedIndicatorValues.sourcingRecordId = sourcingData.sourcingRecordId;
    calculatedIndicatorValues[INDICATOR_TYPES.DEFORESTATION] =
      newIndicatorCoefficients[INDICATOR_TYPES.DEFORESTATION] *
      sourcingData.tonnage;
    calculatedIndicatorValues[INDICATOR_TYPES.BIODIVERSITY_LOSS] =
      newIndicatorCoefficients[INDICATOR_TYPES.BIODIVERSITY_LOSS] *
      sourcingData.tonnage;
    calculatedIndicatorValues[INDICATOR_TYPES.CARBON_EMISSIONS] =
      newIndicatorCoefficients[INDICATOR_TYPES.CARBON_EMISSIONS] *
      sourcingData.tonnage;
    calculatedIndicatorValues[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE] =
      newIndicatorCoefficients[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE] *
      sourcingData.tonnage;
    return calculatedIndicatorValues;
  }
}
