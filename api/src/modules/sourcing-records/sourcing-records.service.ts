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
import { GetImpactTableDto } from '../impact/dto/get-impact-table.dto';

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
        'updatedBy',
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

  async getDataForImpactTable(
    getImpactTableDto: GetImpactTableDto,
  ): Promise<any> {
    return this.sourcingRecordRepository.getDataForImpactTable(
      getImpactTableDto,
    );
  }
}
