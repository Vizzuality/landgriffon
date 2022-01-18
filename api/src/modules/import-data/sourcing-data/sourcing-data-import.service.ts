import { Injectable, Logger } from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { FileService } from 'modules/import-data/file.service';
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
import { Material } from 'modules/materials/material.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';

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
export class SourcingDataImportService {
  protected readonly logger: Logger = new Logger(
    SourcingDataImportService.name,
  );

  constructor(
    protected readonly materialService: MaterialsService,
    protected readonly businessUnitService: BusinessUnitsService,
    protected readonly supplierService: SuppliersService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly geoRegionsService: GeoRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
    protected readonly sourcingRecordService: SourcingRecordsService,
    protected readonly sourcingLocationGroupService: SourcingLocationGroupsService,
    protected readonly fileService: FileService<SourcingRecordsSheets>,
    protected readonly dtoProcessor: SourcingRecordsDtoProcessorService,
    protected readonly geoCodingService: GeoCodingService,
    protected readonly indicatorRecordsService: IndicatorRecordsService,
  ) {}

  async importSourcingData(filePath: string): Promise<any> {
    this.logger.log(`Starting import process`);
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedXLSXDataset: SourcingRecordsSheets =
        await this.fileService.transformToJson(filePath, SHEETS_MAP);

      const sourcingLocationGroup: SourcingLocationGroup =
        await this.sourcingLocationGroupService.create({
          title: 'Sourcing Records import from XLSX file',
        });
      const dtoMatchedData: SourcingRecordsDtos =
        await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(
          parsedXLSXDataset,
          sourcingLocationGroup.id,
        );

      this.logger.log(`Validating DTOs`);
      await this.validateDTOs(dtoMatchedData);
      await this.cleanDataBeforeImport();

      const materials: Material[] =
        await this.materialService.findAllUnpaginated();
      if (!materials.length) {
        throw new Error(
          'No Materials found present in the DB. Please check the LandGriffon installation manual',
        );
      }

      const businessUnits: BusinessUnit[] =
        await this.businessUnitService.createTree(dtoMatchedData.businessUnits);

      const suppliers: Supplier[] = await this.supplierService.createTree(
        dtoMatchedData.suppliers,
      );
      const sourcingDataWithOrganizationalEntities: any =
        this.relateSourcingDataWithOrganizationalEntities(
          suppliers,
          businessUnits,
          materials,
          dtoMatchedData.sourcingData,
        );

      const geoCodedSourcingData: SourcingData[] =
        await this.geoCodingService.geoCodeLocations(
          sourcingDataWithOrganizationalEntities,
        );

      await this.sourcingLocationService.save(geoCodedSourcingData);

      const sourcingRecords: SourcingRecord[] =
        await this.sourcingRecordService.findAllUnpaginated();
      this.logger.log(
        `Generating indicator records for ${sourcingRecords.length} sourcing records`,
      );

      //  for (const sourcingRecord of sourcingRecords) {
      //    try {
      //      await this.indicatorRecordsService.calculateImpactValue(
      //        sourcingRecord,
      //      );
      //    } catch (error) {
      //      // TODO: once we have complete data, this try/catch block can be removed, as we should aim to not have missing h3 data.
      //      if (error instanceof MissingH3DataError) {
      //        this.logger.log(error.toString());
      //      }
      //      throw error;
      //    }
      //  }

      this.logger.log('Indicator records generated');
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }

  private async validateDTOs(
    dtoLists: SourcingRecordsDtos,
  ): Promise<void | Array<ErrorConstructor>> {
    const validationErrorArray: Error[] = [];
    for (const parsedSheet in dtoLists) {
      if (dtoLists.hasOwnProperty(parsedSheet)) {
        for (const dto of dtoLists[parsedSheet as keyof SourcingRecordsDtos]) {
          try {
            await validateOrReject(dto);
          } catch (err) {
            validationErrorArray.push(err as Error);
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
    this.logger.log('Cleaning database before import...');
    try {
      await this.indicatorRecordsService.clearTable();
      await this.businessUnitService.clearTable();
      await this.supplierService.clearTable();
      await this.sourcingLocationService.clearTable();
      await this.sourcingRecordService.clearTable();
    } catch ({ message }) {
      throw new Error(
        `Database could not been cleaned before loading new dataset: ${message}`,
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
    materials: Material[],
    sourcingData: SourcingData[],
  ): any {
    this.logger.log(`Relating sourcing data with organizational entities`);
    this.logger.log(`Supplier count: ${suppliers.length}`);
    this.logger.log(`Business Units count: ${businessUnits.length}`);
    this.logger.log(`Materials count: ${materials.length}`);
    this.logger.log(`Sourcing Data count: ${sourcingData.length}`);

    const materialMap: Record<number, string> = {};
    materials.forEach((material: Material) => {
      if (!material.hsCodeId) {
        return;
      }
      materialMap[parseInt(material.hsCodeId)] = material.id;
    });

    for (const sourcingLocation of sourcingData) {
      for (const supplier of suppliers) {
        if (sourcingLocation.producerId === supplier.mpath) {
          sourcingLocation.producerId = supplier.id;
        }
        if (sourcingLocation.t1SupplierId === supplier.mpath) {
          sourcingLocation.t1SupplierId = supplier.id;
        }
      }
      for (const businessUnit of businessUnits) {
        if (sourcingLocation.businessUnitId === businessUnit.mpath) {
          sourcingLocation.businessUnitId = businessUnit.id;
        }
      }
      if (typeof sourcingLocation.materialId === 'undefined') {
        return;
      }
      const sourcingLocationMaterialId: number = parseInt(
        sourcingLocation.materialId,
      );

      if (!(sourcingLocationMaterialId in materialMap)) {
        throw new Error(
          `Could not import sourcing location - material code ${sourcingLocationMaterialId} not found`,
        );
      }
      sourcingLocation.materialId = materialMap[sourcingLocationMaterialId];
    }
    return sourcingData;
  }
}
