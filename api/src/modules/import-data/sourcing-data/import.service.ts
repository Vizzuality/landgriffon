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
} from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';
import { validateOrReject } from 'class-validator';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { Supplier } from 'modules/suppliers/supplier.entity';

export interface LocationData {
  locationAddressInput?: string;
  locationCountryInput?: string;
  locationLatitude?: string;
  locationLongitude?: string;
}

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
    protected readonly geoCodingService: GeoCodingService,
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
      const materials = await this.materialService.createTree(
        dtoMatchedData.materials,
      );
      const businessUnits = await this.businessUnitService.createTree(
        dtoMatchedData.businessUnits,
      );

      const suppliers = await this.supplierService.createTree(
        dtoMatchedData.suppliers,
      );
      const sourcingDataWithOrganizationalEntities = this.relateSourcingDataWithOrganizationalEntities(
        suppliers,
        businessUnits,
        materials,
        dtoMatchedData.sourcingData,
      );

      const geoCodedSourcingData = await this.geoCodingService.geoCodeLocations(
        sourcingDataWithOrganizationalEntities,
      );
      await this.sourcingLocationService.save(geoCodedSourcingData);
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
   * TODO: Check if we need to clean admin-regions up (plus geo-regions)
   * The latter should be loaded as part of the data-pipeline importing GADM
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
   * @note: Type hack as mpath property does not exist on Materials and BusinessUnits, but its created
   * by typeorm when using @Tree('materialized-path)'.
   * It's what we can use to know which material/business unit relates to which sourcing-location
   * in a synchronous way avoiding hitting the DB
   */
  relateSourcingDataWithOrganizationalEntities(
    suppliers: Supplier[],
    businessUnits: Record<string, any>[],
    materials: Record<string, any>[],
    sourcingData: SourcingData[],
  ): any {
    for (const sourcingLocation of sourcingData) {
      for (const supplier of suppliers) {
        if (sourcingLocation.producerId === supplier.name) {
          sourcingLocation.producerId = supplier.id;
        }
        if (sourcingLocation.t1SupplierId === supplier.name) {
          sourcingLocation.t1SupplierId = supplier.id;
        }
      }
      for (const businessUnit of businessUnits) {
        if (sourcingLocation.businessUnitId === businessUnit.mpath) {
          sourcingLocation.businessUnitId = businessUnit.id;
        }
      }
      for (const material of materials) {
        if (sourcingLocation.materialId === material.mpath) {
          sourcingLocation.materialId = material.id;
        }
      }
    }
    return sourcingData;
  }
}
