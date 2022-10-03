import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
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
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Material } from 'modules/materials/material.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { TasksService } from 'modules/tasks/tasks.service';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import * as config from 'config';

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
    protected readonly geoCodingService: GeoCodingAbstractClass,
    protected readonly indicatorRecordsService: IndicatorRecordsService,
    protected readonly tasksService: TasksService,
    protected readonly scenarioService: ScenariosService,
  ) {}

  async importSourcingData(filePath: string, taskId: string): Promise<any> {
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
      // TODO: TBD What to do when there is some location where we cannot determine its admin-region: i.e coordinates
      //       in the middle of the sea
      const geoCodedSourcingData: SourcingData[] =
        await this.geoCodingService.geoCodeLocations(
          sourcingDataWithOrganizationalEntities,
        );
      const warnings: string[] = [];
      geoCodedSourcingData.forEach((elem: SourcingData) => {
        if (elem.locationWarning) warnings.push(elem.locationWarning);
      });
      warnings.length > 0 &&
        (await this.tasksService.updateImportJobEvent({
          taskId,
          newLogs: warnings,
        }));

      await this.sourcingLocationService.save(geoCodedSourcingData);

      this.logger.log('Generating Indicator Records...');

      // TODO: Current approach calculates Impact for all Sourcing Records present in the DB
      //       Getting H3 data for calculations is done within DB so we need to improve the error handling
      //       TBD: What to do when there is no H3 for a Material
      try {
        // TODO remove feature flag selection, once the solution has been approved
        config.get('featureFlags.simpleImportCalculations')
          ? await this.indicatorRecordsService.createIndicatorRecordsForAllSourcingRecordsV2()
          : await this.indicatorRecordsService.createIndicatorRecordsForAllSourcingRecords();
        this.logger.log('Indicator Records generated');
        // TODO: Hack to force m.view refresh once Indicator Records are persisted. This should be automagically
        //       done by the AfterInsert() event listener placed in indicator-record.entity.ts
        await IndicatorRecord.updateImpactView();
      } catch (err: any) {
        if (err instanceof MissingH3DataError) {
          throw new MissingH3DataError(
            `Missing H3 Data to calculate Impact in Import`,
          );
        }
        throw err;
      }
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
    if (validationErrorArray.length)
      throw new BadRequestException(`${validationErrorArray}`);
  }

  /**
   * @note: Deletes DB content from required entities
   * to ensure DB is prune prior loading a XLSX dataset
   */
  async cleanDataBeforeImport(): Promise<void> {
    this.logger.log('Cleaning database before import...');
    try {
      await this.scenarioService.clearTable();
      await this.indicatorRecordsService.clearTable();
      await this.businessUnitService.clearTable();
      await this.supplierService.clearTable();
      await this.sourcingLocationService.clearTable();
      await this.sourcingRecordService.clearTable();
      await this.geoRegionsService.deleteGeoRegionsCreatedByUser();
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

  async validateFile(
    filePath: string,
    filename: string,
  ): Promise<void | Array<ErrorConstructor>> {
    let parsedXLSXDataset: SourcingRecordsSheets;
    try {
      parsedXLSXDataset = await this.fileService.transformToJson(
        filePath,
        SHEETS_MAP,
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        `File: ${filename} could not have been loaded. Please try again later or contact the administrator`,
      );
    }

    /**
     * @note: If we decide to path DTOs to task instead of path
     * this has to change to generate valid id
     */

    let dtoMatchedData: SourcingRecordsDtos;

    try {
      dtoMatchedData =
        await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(
          parsedXLSXDataset,
        );
    } catch (error) {
      await this.fileService.deleteDataFromFS(filePath);
      throw error;
    }

    this.logger.log(`Validating DTOs`);
    try {
      await this.validateDTOs(dtoMatchedData);
    } catch (error) {
      await this.fileService.deleteDataFromFS(filePath);
      throw error;
    }
  }
}
