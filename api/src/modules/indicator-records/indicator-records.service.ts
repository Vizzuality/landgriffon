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
import {
  SourcingRecordDataForImpact,
  SourcingRecordsService,
} from 'modules/sourcing-records/sourcing-records.service';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { IndicatorRecordCalculatedValuesDto } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';

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

  async createIndicatorRecordsForAllSourcingRecords(): Promise<any> {
    const indicators: {
      id: string;
      nameCode: string;
      h3DataId: string;
    }[] = await this.indicatorService.getIndicatorsAndRelatedH3DataIds();
    const rawData: SourcingRecordsWithIndicatorRawDataDto[] =
      await this.sourcingRecordsService.getSourcingRecordDataToCalculateIndicatorRecords();
    const calculatedData: IndicatorRecordCalculatedValuesDto[] = rawData.map(
      (sourcingRecordData: SourcingRecordsWithIndicatorRawDataDto) =>
        this.calculateIndicatorValues(sourcingRecordData),
    );
    const indicatorMapper: Record<string, any> = {};
    indicators.forEach(
      (indicator: { id: string; nameCode: string; h3DataId: string }) => {
        indicatorMapper[indicator.nameCode] = indicator;
      },
    );
    const indicatorRecords: IndicatorRecord[] = [];
    calculatedData.forEach(
      (calculatedIndicatorRecords: IndicatorRecordCalculatedValuesDto) => {
        const indicatorRecordDeforestation: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords[INDICATOR_TYPES.DEFORESTATION],
            indicatorId: indicatorMapper[INDICATOR_TYPES.DEFORESTATION].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            h3DataId: indicatorMapper[INDICATOR_TYPES.DEFORESTATION].h3DataId,
          });
        const indicatorRecordBiodiversity: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value:
              calculatedIndicatorRecords[INDICATOR_TYPES.BIODIVERSITY_LOSS],
            indicatorId: indicatorMapper[INDICATOR_TYPES.BIODIVERSITY_LOSS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            h3DataId:
              indicatorMapper[INDICATOR_TYPES.BIODIVERSITY_LOSS].h3DataId,
          });
        const indicatorRecordCarbonEmissions: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: calculatedIndicatorRecords[INDICATOR_TYPES.CARBON_EMISSIONS],
            indicatorId: indicatorMapper[INDICATOR_TYPES.CARBON_EMISSIONS].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            h3DataId:
              indicatorMapper[INDICATOR_TYPES.CARBON_EMISSIONS].h3DataId,
          });
        const indicatorRecordUnsustainableWater: IndicatorRecord =
          IndicatorRecord.merge(new IndicatorRecord(), {
            value:
              calculatedIndicatorRecords[
                INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE
              ],
            indicatorId:
              indicatorMapper[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE].id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: calculatedIndicatorRecords.sourcingRecordId,
            scaler: calculatedIndicatorRecords.production,
            h3DataId:
              indicatorMapper[INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE].h3DataId,
          });
        indicatorRecords.push(
          indicatorRecordDeforestation,
          indicatorRecordBiodiversity,
          indicatorRecordCarbonEmissions,
          indicatorRecordUnsustainableWater,
        );
      },
    );
    await this.indicatorRecordRepository.insert(indicatorRecords);
  }

  /**
   * TODO: Use for calculate Impact for new Scenarios. The method expects a GeoRegion Id and a Material Id from a related Sourcing Record
   *       Will need to refactor once PR: https://github.com/Vizzuality/landgriffon/pull/231 is merged
   */

  async createIndicatorRecordsBySourcingRecord(
    geoRegionId: string,
    materialId: string,
  ): Promise<IndicatorRecord[]> {
    return this.indicatorRecordRepository.getIndicatorRawDataByGeoRegionAndMaterial(
      geoRegionId,
      materialId,
    );
  }

  private calculateIndicatorValues(
    sourcingRecordData: SourcingRecordsWithIndicatorRawDataDto,
  ): IndicatorRecordCalculatedValuesDto {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDto =
      new IndicatorRecordCalculatedValuesDto();
    calculatedIndicatorValues.sourcingRecordId =
      sourcingRecordData.sourcingRecordId;
    calculatedIndicatorValues.production = sourcingRecordData.production;
    calculatedIndicatorValues.landPerTon =
      sourcingRecordData.harvestedArea / sourcingRecordData.production;
    calculatedIndicatorValues.deforestationPerHarvestedAreaLandUse =
      sourcingRecordData.rawDeforestation / sourcingRecordData.harvestedArea;
    calculatedIndicatorValues.biodiversityLossPerHarvestedAreaLandUse =
      sourcingRecordData.rawBiodiversity / sourcingRecordData.harvestedArea;
    calculatedIndicatorValues.carbonLossPerHarvestedAreaLandUse =
      sourcingRecordData.rawCarbon / sourcingRecordData.harvestedArea;
    calculatedIndicatorValues.landUse =
      calculatedIndicatorValues.landPerTon * sourcingRecordData.tonnage;

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
}
