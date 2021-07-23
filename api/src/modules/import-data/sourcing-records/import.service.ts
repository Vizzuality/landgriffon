import { Injectable, Logger } from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { ImportDataService } from 'modules/import-data/import-data.service';
import {
  SourcingData,
  SourcingRecordsDtoProcessorService,
  SourcingRecordsDtos,
} from 'modules/import-data/sourcing-records/dto-processor.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';
import { validateOrReject } from 'class-validator';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

export interface SourcingRecordsSheets extends Record<string, any[]> {
  materials: Record<string, any>[];
  countries: Record<string, any>[];
  businessUnits: Record<string, any>[];
  suppliers: Record<string, any>[];
  sourcingData: Record<string, any>[];
}

const SHEETS_MAP: Record<string, keyof SourcingRecordsSheets> = {
  materials: 'materials',
  'business units': 'businessUnits',
  suppliers: 'suppliers',
  countries: 'countries',
  'for upload': 'sourcingData',
};

@Injectable()
export class SourcingRecordsImportService {
  protected readonly logger: Logger = new Logger(
    SourcingRecordsImportService.name,
  );

  constructor(
    protected readonly materialService: MaterialsService,
    protected readonly businessUnitService: BusinessUnitsService,
    protected readonly supplierService: SuppliersService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
    protected readonly sourcingRecordService: SourcingRecordsService,
    protected readonly sourcingLocationGroupService: SourcingLocationGroupsService,
    protected readonly fileService: ImportDataService<SourcingRecordsSheets>,
    protected readonly dtoProcessor: SourcingRecordsDtoProcessorService,
  ) {}

  async importSourcingRecords(filePath: string): Promise<any> {
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedXLSXDataset: SourcingRecordsSheets = await this.fileService.transformToJson(
        filePath,
        SHEETS_MAP,
      );

      const sourcingLocationGroup: SourcingLocationGroup = await this.sourcingLocationGroupService.create(
        {
          title: 'Sourcing Records import from XLSX file',
        },
      );
      const dtoMatchedData: SourcingRecordsDtos = await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(
        parsedXLSXDataset,
        sourcingLocationGroup.id,
      );
      await this.validateDTOs(dtoMatchedData);

      await this.cleanDataBeforeImport();
      await this.materialService.createTree(dtoMatchedData.materials);
      await this.businessUnitService.createTree(dtoMatchedData.businessUnits);
      await this.supplierService.createTree(dtoMatchedData.suppliers);
      await this.adminRegionService.createTree(dtoMatchedData.adminRegions);
      return await this.saveSourcingData(dtoMatchedData.sourcingData);
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }

  private async validateDTOs(
    dtoLists: SourcingRecordsDtos,
  ): Promise<void | Array<ErrorConstructor>> {
    const validationErrorArray: Array<typeof Error> = [];
    for (const parsedSheet in dtoLists) {
      if (dtoLists.hasOwnProperty(parsedSheet)) {
        for (const dto of dtoLists[parsedSheet as keyof SourcingRecordsDtos]) {
          try {
            await validateOrReject(dto);
          } catch (err) {
            validationErrorArray.push(err);
          }
        }
      }
    }

    /**
     * @note If errors are thrown, we should bypass all-exceptions.exception.filter.ts
     * in order to return the array containing errors in a more readable way
     * Or add a function per entity to validate
     */
    if (validationErrorArray.length) throw new Error(`${validationErrorArray}`);
  }

  /**
   * @note: Deletes DB content from required entities
   * to ensure DB is prune prior loading a XLSX dataset
   */
  private async cleanDataBeforeImport(): Promise<void> {
    this.logger.log('Cleaning Database...');
    try {
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
   *
   * @param sourcingData: Array of Sourcing-Locations with nested Sourcing-Records
   * @private
   * Saves each Sourcing Location and returns and ID to attach to its related
   * Sourcing-Records, to keep relation
   * Save Sourcing-Record array (ORM will manage better than us) with attached Sourcing-Location ID
   * @debt: There MUST be a cleaner and more performant way to do this
   */

  private async saveSourcingData(sourcingData: SourcingData[]): Promise<void> {
    await Promise.all(
      sourcingData.map(async (sourcingLocation: any) => {
        const { id } = await this.sourcingLocationService.save(
          sourcingLocation,
        );
        const sourcingRecords: SourcingRecord[] = sourcingLocation.sourcingRecords.map(
          (sourcingRecord: SourcingRecord) => ({
            ...sourcingRecord,
            sourcingLocationId: id,
          }),
        );
        await this.sourcingRecordService.save(sourcingRecords);
      }),
    );
  }
}
