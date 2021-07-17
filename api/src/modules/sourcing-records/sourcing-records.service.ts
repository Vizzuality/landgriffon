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
import { XLSXParserService } from 'modules/files/xlsx-parser.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { DTOTransformedData } from '../data-validation/dto-processor.service';

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
    protected readonly materialService: MaterialsService,
    protected readonly businessUnitService: BusinessUnitsService,
    protected readonly supplierService: SuppliersService,
    protected readonly fileService: FileService,
    protected readonly xlsxParser: XLSXParserService,
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

  /**
   * @TODO:
   * - start the transaction (in a future PR)
   * - wipe the selected BD tables
   * - Import sheets in order
   */

  async loadXLSXDataSet(filePath: string): Promise<void> {
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedXLSXDataset: DTOTransformedData = await this.xlsxParser.transformToJson(
        filePath,
      );
      // TODO: Try to persist at this point
      await this.materialService.createTree(parsedXLSXDataset.materials);
      await this.businessUnitService.createTree(
        parsedXLSXDataset.businessUnits,
      );
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }
}
