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
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
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

@Injectable()
export class IndicatorRecordsService extends AppBaseService<
  IndicatorRecord,
  CreateIndicatorRecordDto,
  UpdateIndicatorRecordDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(IndicatorRecordRepository)
    protected readonly indicatorRecordRepository: IndicatorRecordRepository,
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
    sourcingRecord: SourcingRecord,
    type: MATERIAL_TO_H3_TYPE,
  ): Promise<H3Data | null> {
    let h3Table: H3Data | undefined =
      await this.materialsToH3sService.findH3DataForMaterial({
        materialId: sourcingRecord.sourcingLocation.material.id,
        year: sourcingRecord.year,
        type,
      });

    if (h3Table) {
      return h3Table;
    }

    switch (config.get('import.missingDataFallbackStrategy')) {
      case 'ignore':
        this.logger.log(
          `Cannot calculate impact for sourcing record - missing ${type} h3 data for material "${sourcingRecord.sourcingLocation.material.name}" and year "${sourcingRecord.year}". Ignoring souring record`,
        );
        return null;
        break;
      case 'fallback':
        this.logger.debug(
          `Missing ${type} h3 data for material "${sourcingRecord.sourcingLocation.material.name}" and year "${sourcingRecord.year}". Falling back to different year`,
        );
        const h3DataYearToApply: number | undefined =
          await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
            sourcingRecord.sourcingLocation.material.id,
            type,
            sourcingRecord.year,
          );
        h3Table = await this.materialsToH3sService.findH3DataForMaterial({
          materialId: sourcingRecord.sourcingLocation.material.id,
          year: h3DataYearToApply,
          type,
        });
        if (!h3Table) {
          throw new MissingH3DataError(
            `Cannot calculate impact for sourcing record - missing ${type} h3 data for material "${sourcingRecord.sourcingLocation.material.name}" with year fallback strategy`,
          );
        }
        return h3Table;
        break;
      case 'error':
        throw new MissingH3DataError(
          `Cannot calculate impact for sourcing record - missing ${type} h3 data for material "${sourcingRecord.sourcingLocation.material.name}" and year "${sourcingRecord.year}"`,
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
    sourcingRecord: SourcingRecord,
  ): Promise<IndicatorRecord[]> {
    this.logger.debug(
      `Calculating impact value for sourcing record ${sourcingRecord.id}`,
    );
    const indicators: Indicator[] =
      await this.indicatorService.findAllUnpaginated();

    if (!sourcingRecord.sourcingLocation.geoRegion) {
      throw new Error(
        'Cannot calculate impact for sourcing record - missing geoRegion (through sourcingLocation)',
      );
    }
    if (!sourcingRecord.sourcingLocation.material) {
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
}
