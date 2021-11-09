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
import { Indicator } from 'modules/indicators/indicator.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';

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

  async getIndicatorRecordById(id: number): Promise<IndicatorRecord> {
    const found:
      | IndicatorRecord
      | undefined = await this.indicatorRecordRepository.findOne(id);
    if (!found) {
      throw new NotFoundException(`Indicator Record with ID "${id}" not found`);
    }

    return found;
  }

  async calculateImpactValue(
    sourcingRecord: SourcingRecord,
  ): Promise<IndicatorRecord[]> {
    this.logger.log(
      `Calculating impact value for sourcing record ${sourcingRecord.id}`,
    );
    const indicators: Indicator[] = await this.indicatorService.findAllUnpaginated();

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
    const productionValue: number = await this.h3DataService.getProductionForGeoRegion(
      sourcingRecord.sourcingLocation.geoRegion,
      sourcingRecord.sourcingLocation.material,
    );

    const indicatorRecords: IndicatorRecord[] = await Promise.all(
      indicators.map(
        async (indicator: Indicator): Promise<IndicatorRecord> => {
          const impactValue: number = await this.h3DataService.getImpactForGeoRegion(
            sourcingRecord.sourcingLocation.geoRegion,
            indicator,
          );

          return IndicatorRecord.merge(new IndicatorRecord(), {
            value: (impactValue * sourcingRecord.tonnage) / productionValue,
            indicatorId: indicator.id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: sourcingRecord.id,
          });
        },
      ),
    );

    this.logger.log(
      `Impact value for sourcing record ${sourcingRecord.id} saved.`,
    );
    return this.indicatorRecordRepository.save(indicatorRecords);
  }

  async clearTable(): Promise<void> {
    await this.indicatorRecordRepository.delete({});
  }
}
