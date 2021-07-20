import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { FileService } from 'modules/files/file.service';
import { XLSXParserService } from 'modules/files/xlsx-parser.service';
import { DTOTransformedData } from 'modules/data-validation/dto-processor.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingRecordGroupsService } from 'modules/sourcing-record-groups/sourcing-record-groups.service';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class ImportDataService {
  protected readonly logger: Logger = new Logger(ImportDataService.name);
  constructor(
    protected readonly materialService: MaterialsService,
    protected readonly businessUnitService: BusinessUnitsService,
    protected readonly supplierService: SuppliersService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
    protected readonly sourcingRecordService: SourcingRecordsService,
    protected readonly sourcingRecordGroupService: SourcingRecordGroupsService,
    protected readonly fileService: FileService,
    protected readonly xlsxParser: XLSXParserService,
  ) {}

  async loadXLSXDataSet(filePath: string): Promise<void> {
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedXLSXDataset: DTOTransformedData = await this.xlsxParser.transformToJson(
        filePath,
      );
      await this.cleanDataBeforeLoadingXLSX();
      await this.materialService.createTree(parsedXLSXDataset.materials);
      await this.businessUnitService.createTree(
        parsedXLSXDataset.businessUnits,
      );
      await this.supplierService.createTree(parsedXLSXDataset.suppliers);
      await this.adminRegionService.createTree(parsedXLSXDataset.adminRegions);
      await this.sourcingLocationService.save(
        await this.addBaseSourcingRecordGroup(
          parsedXLSXDataset.sourcingLocations,
        ),
      );
      await this.sourcingRecordService.save(parsedXLSXDataset.sourcingRecords);
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }
  /**
   * @note: Deletes DB content from required entities
   * to ensure DB is prune prior loading a XLSX dataset
   */
  async cleanDataBeforeLoadingXLSX(): Promise<void> {
    this.logger.log('Cleaning Database...');
    try {
      await this.sourcingRecordGroupService.clearTable();
      await this.materialService.clearTable();
      await this.businessUnitService.clearTable();
      await this.supplierService.clearTable();
      await this.sourcingLocationService.clearTable();
      await this.sourcingRecordService.clearTable();
    } catch (err) {
      throw new Error(
        `Database could not been cleaned before loading new dataset: ${err.message}`,
      );
    }
  }

  /**
   * @note: A base sourcing-record-group is created each time a new
   * data-set is uploaded.
   * The resultant ID is attached to each Sourcing Location to establish relation
   */
  private async addBaseSourcingRecordGroup(
    sourcingLocationData: CreateSourcingLocationDto[],
  ): Promise<CreateSourcingLocationDto[]> {
    const srcGrpId = (
      await this.sourcingRecordGroupService.create({
        title: 'Custom Sourcing Record',
      })
    ).id;
    return sourcingLocationData.map((sourcingLocation: any) => ({
      ...sourcingLocation,
      sourcingRecordGroupId: srcGrpId,
    }));
  }
}
