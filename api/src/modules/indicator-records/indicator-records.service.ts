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

  async calculateImpactValue(
    sourcingRecord: SourcingRecordDataForImpact,
  ): Promise<IndicatorRecord[]> {
    this.logger.debug(
      `Calculating impact value for sourcing record ${sourcingRecord.id}`,
    );
    const indicators: Indicator[] =
      await this.indicatorService.findAllUnpaginated();

    if (!sourcingRecord.geoRegionId) {
      throw new Error(
        'Cannot calculate impact for sourcing record - missing geoRegion (through sourcingLocation)',
      );
    }
    if (!sourcingRecord.materialId) {
      throw new Error(
        'Cannot calculate impact for sourcing record - missing material (through sourcingLocation)',
      );
    }

    const producerH3Table: H3Data | null =
      await this.getH3DataForSourcingRecord(
        sourcingRecord,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

    if (!producerH3Table) {
      return [];
    }

    const harvestH3Table: H3Data | null = await this.getH3DataForSourcingRecord(
      sourcingRecord,
      MATERIAL_TO_H3_TYPE.HARVEST,
    );

    if (!harvestH3Table) {
      return [];
    }

    const indicatorRecords: IndicatorRecord[] = [];

    await Promise.all(
      indicators.map(async (indicator: Indicator): Promise<void> => {
        const indicatorH3Table: H3Data | undefined =
          await this.h3DataService.findH3ByIndicatorId(indicator.id);

        if (!indicatorH3Table) {
          throw new Error(
            'Cannot calculate impact for sourcing record - missing indicator h3 data',
          );
        }

        let impactValue: number | null = null;

        switch (indicator.nameCode) {
          case INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE:
            impactValue =
              await this.h3DataService.getWaterRiskIndicatorRecordValue(
                producerH3Table,
                harvestH3Table,
                indicatorH3Table,
                sourcingRecord.id,
              );
            break;
          case INDICATOR_TYPES.DEFORESTATION:
            impactValue =
              await this.h3DataService.getDeforestationLossIndicatorRecordValue(
                producerH3Table,
                harvestH3Table,
                indicatorH3Table,
                sourcingRecord.id,
              );
            break;
          case INDICATOR_TYPES.BIODIVERSITY_LOSS:
            impactValue =
              await this.h3DataService.getBiodiversityLossIndicatorRecordValue(
                producerH3Table,
                harvestH3Table,
                indicatorH3Table,
                sourcingRecord.id,
              );
            break;
          case INDICATOR_TYPES.CARBON_EMISSIONS:
            impactValue =
              await this.h3DataService.getCarbonIndicatorRecordValue(
                producerH3Table,
                harvestH3Table,
                indicatorH3Table,
                sourcingRecord.id,
              );
            break;

          default:
            this.logger.debug(
              `Indicator Record calculation for indicator '${indicator.name}' not supported;`,
            );
        }

        if (impactValue === null) {
          return;
        }

        const indicatorRecord: IndicatorRecord = IndicatorRecord.merge(
          new IndicatorRecord(),
          {
            value: impactValue,
            indicatorId: indicator.id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: sourcingRecord.id,
          },
        );

        await this.indicatorRecordRepository.insert(indicatorRecord);
        indicatorRecords.push(indicatorRecord);
      }),
    );

    this.logger.debug(
      `Impact value for sourcing record ${sourcingRecord.id} saved.`,
    );
    return indicatorRecords;
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
            h3DataId: indicatorMap[INDICATOR_TYPES.DEFORESTATION].h3DataId,
          });
        const indicatorRecordBiodiversity: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value:
              calculatedIndicatorRecords[INDICATOR_TYPES.BIODIVERSITY_LOSS],
            indicatorId: indicatorMap[INDICATOR_TYPES.BIODIVERSITY_LOSS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            h3DataId: indicatorMap[INDICATOR_TYPES.BIODIVERSITY_LOSS].h3DataId,
          });
        const indicatorRecordCarbonEmissions: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords[INDICATOR_TYPES.CARBON_EMISSIONS],
            indicatorId: indicatorMap[INDICATOR_TYPES.CARBON_EMISSIONS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            h3DataId: indicatorMap[INDICATOR_TYPES.CARBON_EMISSIONS].h3DataId,
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
            h3DataId:
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
  ): Promise<any> {
    const { geoRegionId, materialId } = sourcingData;
    let calculatedIndicatorRecordValues: IndicatorRecordCalculatedValuesDto;
    if (providedCoefficients) {
      calculatedIndicatorRecordValues = this.useProvidedIndicatorCoefficients(
        providedCoefficients,
        sourcingData,
      );
    } else {
      const materialH3Data: MaterialToH3 | undefined =
        await this.materialsToH3sService.findOne({ where: { materialId } });
      if (!materialH3Data) {
        throw new MissingH3DataError(
          `No H3 Data required for calculate Impact for Material with ID: ${materialId}`,
        );
      }
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

    // Create the Indicator Records entities from the calculated indicator values
    const indicatorMapper: Record<string, any> = await this.getIndicatorMap();
    const indicatorTypes: INDICATOR_TYPES[] = [
      INDICATOR_TYPES.DEFORESTATION,
      INDICATOR_TYPES.CARBON_EMISSIONS,
      INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      INDICATOR_TYPES.BIODIVERSITY_LOSS,
    ];

    const indicatorRecords: IndicatorRecord[] = indicatorTypes.map(
      (indicatorType: INDICATOR_TYPES) => {
        return IndicatorRecordsService.createIndicatorRecord(
          indicatorType,
          calculatedIndicatorRecordValues,
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
   * @param indicatorMapper
   * @private
   */
  private static createIndicatorRecord(
    indicatorType: INDICATOR_TYPES,
    calculatedValues: IndicatorRecordCalculatedValuesDto,
    indicatorMapper: Record<string, any>,
  ): IndicatorRecord {
    return IndicatorRecord.merge(new IndicatorRecord(), {
      value: calculatedValues[indicatorType],
      indicatorId: indicatorMapper[indicatorType].id,
      status: INDICATOR_RECORD_STATUS.SUCCESS,
      sourcingRecordId: calculatedValues.sourcingRecordId,
      scaler: calculatedValues.production,
      h3DataId: indicatorMapper[indicatorType].h3DataId,
    });
  }

  /**
   * @description Consumes Indicator Raw Data from the DB to calculate final values for Indicator Records
   */

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
