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
  ActualVsScenarioImpactTableData,
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

  async getSourcingRecordById(id: string): Promise<SourcingRecord> {
    const found: SourcingRecord | null =
      await this.sourcingRecordRepository.findOne({ where: { id } });

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
   * @deprecated: Will be removed to impact repository
   */

  // TODO: Add a repository in Impact Module to get this data
  async getDataForImpactTable(
    getImpactTableDto: BaseImpactTableDto,
  ): Promise<ImpactTableData[]> {
    return this.sourcingRecordRepository.getDataForImpactTable(
      getImpactTableDto,
    );
  }

  async getDataForActualVsScenarioImpactTable(
    getActualVsScenarioImpactTableDto: GetActualVsScenarioImpactTableDto,
  ): Promise<ActualVsScenarioImpactTableData[]> {
    return this.sourcingRecordRepository.getDataForActualVsScenarioImpactTable(
      getActualVsScenarioImpactTableDto,
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
}
