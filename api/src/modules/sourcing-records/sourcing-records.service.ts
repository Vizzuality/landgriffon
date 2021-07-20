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
        'sourcingLocationsId',
        'metadata',
        'createdAt',
        'updatedAt',
        'updatedById',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getSourcingRecordById(id: number): Promise<SourcingRecord> {
    const found = await this.sourcingRecordRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Sourcing Record with ID "${id}" not found`);
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.sourcingRecordRepository.delete({});
  }
  async save(entityArray: any[]): Promise<void> {
    await this.sourcingRecordRepository.save(entityArray);
  }
  async getYears(): Promise<number[]> {
    return this.sourcingRecordRepository.getYears();
  }
}
