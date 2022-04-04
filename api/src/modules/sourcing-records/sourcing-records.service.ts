import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingRecord,
  sourcingRecordResource,
} from 'modules/sourcing-records/sourcing-record.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { UpdateSourcingRecordDto } from 'modules/sourcing-records/dto/update.sourcing-record.dto';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';

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
    @InjectRepository(SourcingRecordRepository)
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

  async getSourcingRecordById(id: number): Promise<SourcingRecord> {
    const found: SourcingRecord | undefined =
      await this.sourcingRecordRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Sourcing Record with ID "${id}" not found`);
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.sourcingRecordRepository.delete({});
  }
  async findAllUnpaginated(): Promise<SourcingRecord[]> {
    return this.sourcingRecordRepository.find();
  }
  async save(entityArray: any[]): Promise<void> {
    await this.sourcingRecordRepository.save(entityArray);
  }
  async getYears(materialIds?: string[]): Promise<number[]> {
    return this.sourcingRecordRepository.getYears(materialIds);
  }

  /**
   * @description Retrieve raw data from DB required to build (on the fly) a Impact Table/Chart
   */

  async getDataForImpactTable(
    getImpactTableDto: GetImpactTableDto,
  ): Promise<any> {
    return this.sourcingRecordRepository.getDataForImpactTable(
      getImpactTableDto,
    );
  }

  /**
   * @description Retrieve required data to calculate Impact for each Sourcing Record
   *
   * - Sourcing Record Id
   * - Sourcing Record Year
   * - Sourcing Record Tonnage
   * - GeoRegion Id
   * - Material Id
   */

  async getSourcingRecordDataToCalculateImpacts(): Promise<
    SourcingRecordDataForImpact[]
  > {
    return this.sourcingRecordRepository
      .createQueryBuilder('sourcingRecords')
      .select([
        'sourcingRecords.id as id',
        'sourcingRecords.year as year',
        'sourcingRecords.tonnage as tonnage',
        'sourcingLocations.materialId as materialId',
        'geoRegions.id as geoRegionId',
      ])
      .innerJoin(
        SourcingLocation,
        'sourcingLocations',
        'sourcingRecords.sourcingLocationId = sourcingLocations.id',
      )
      .innerJoin(
        GeoRegion,
        'geoRegions',
        'sourcingLocations.geoRegionId = geoRegions.id',
      )
      .getRawMany();
  }

  async getSourcingRecordDataToCalculateIndicatorRecords(): Promise<
    SourcingRecordsWithIndicatorRawDataDto[]
  > {
    return this.sourcingRecordRepository.getIndicatorRawDataForAllSourcingRecords();
  }
}
