import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingRecord,
  sourcingRecordResource,
} from 'modules/sourcing-records/sourcing-record.entity';
import { AppInfoDTO } from 'dto/info.dto';
import {
  ImpactTableData,
  SourcingRecordRepository,
} from 'modules/sourcing-records/sourcing-record.repository';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { UpdateSourcingRecordDto } from 'modules/sourcing-records/dto/update.sourcing-record.dto';
import {
  GetActualVsScenarioImpactTableDto,
  BaseImpactTableDto,
} from 'modules/impact/dto/impact-table.dto';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';

export interface SourcingRecordDataForImpact {
  id: string;
  year: number;
  tonnage: number;
  materialId: string;
  geoRegionId: string;
}

@Injectable()
export class SourcingRecordsService extends AppBaseService<
  SourcingRecord,
  CreateSourcingRecordDto,
  UpdateSourcingRecordDto,
  AppInfoDTO
> {
  constructor(
    protected readonly sourcingRecordRepository: SourcingRecordRepository,
  ) {
    super(
      sourcingRecordRepository,
      sourcingRecordResource.name.singular,
      sourcingRecordResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<SourcingRecord> {
    return {
      attributes: [
        'tonnage',
        'year',
        'sourcingLocation',
        'metadata',
        'createdAt',
        'updatedAt',
        'updatedById',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async clearTable(): Promise<void> {
    await this.sourcingRecordRepository.delete({});
  }

  async save(entityArray: any[]): Promise<void> {
    await this.sourcingRecordRepository.save(entityArray);
  }

  async getYears(materialIds?: string[]): Promise<number[]> {
    return this.sourcingRecordRepository.getYears(materialIds);
  }
}
