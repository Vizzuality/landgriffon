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
import { FileService } from 'modules/files/file.service';
import { XlsxParser } from 'modules/files/xlsx.parser';
import { WorkBook } from 'xlsx';

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
    private readonly fileService: FileService,
    private readonly xlsxParser: XlsxParser,
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
        'lastEdited',
        'lastEditedUserId',
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

  async loadXLSXDataSet(filePath: string): Promise<WorkBook> {
    await this.fileService.isFilePresentInFs(filePath);
    try {
      return this.xlsxParser.transformToJson(filePath);
    } catch (err) {
      throw err;
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }
}
