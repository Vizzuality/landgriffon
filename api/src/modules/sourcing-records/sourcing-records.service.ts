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
import { XlsxParserService } from 'modules/files/xlsx-parser.service';
import { WorkSheet } from 'xlsx';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';

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
    private readonly fileService: FileService,
    private readonly xlsxParser: XlsxParserService,
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

  async loadXLSXDataSet(filePath: string): Promise<any> {
    await this.fileService.isFilePresentInFs(filePath);
    try {
      /**
       * Commented out to check response
       */
      return this.xlsxParser.transformToJson(filePath);
      //return await this.populateDb(parsedXlsx);
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }

  async populateDb(stuff: any): Promise<any> {
    const materials = stuff.filter(
      (sheet: WorkSheet) => sheet.sheet === 'materials',
    );
    const businessUnits = stuff.filter(
      (sheet: WorkSheet) => sheet.sheet === 'business units',
    );
    const suppliers = stuff.filter(
      (sheet: WorkSheet) => sheet.sheet === 'suppliers',
    );
    try {
      await this.materialService.saveMany(materials[0].data);
      await this.businessUnitService.saveMany(businessUnits[0].data);
      await this.supplierService.saveMany(suppliers[0].data);
    } catch (err) {
      return { err, materials };
    }
  }
}
