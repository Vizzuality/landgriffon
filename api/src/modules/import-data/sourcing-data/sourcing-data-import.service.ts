import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { FileService } from 'modules/import-data/file.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Material } from 'modules/materials/material.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { TasksService } from 'modules/tasks/tasks.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { Indicator } from 'modules/indicators/indicator.entity';
import { ImpactService } from 'modules/impact/impact.service';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import {
  ExcelValidatorService,
  SourcingDataSheet,
} from 'modules/import-data/sourcing-data/validation/excel-validator.service';
import { ExcelValidationError } from 'modules/import-data/sourcing-data/validation/validators/excel-validation.error';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { SourcingDataDbCleaner } from 'modules/import-data/sourcing-data/sourcing-data.db-cleaner';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

export interface SourcingRecordsSheets extends Record<string, any[]> {
  materials: Record<string, any>[];
  countries: Record<string, any>[];
  businessUnits: Record<string, any>[];
  suppliers: Record<string, any>[];
  sourcingData: Record<string, any>[];
  indicators: Record<string, any>[];
}

const SHEETS_MAP: Record<string, keyof SourcingRecordsSheets> = {
  materials: 'materials',
  'business units': 'businessUnits',
  suppliers: 'suppliers',
  countries: 'countries',
  indicators: 'indicators',
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
    protected readonly sourcingLocationService: SourcingLocationsService,
    protected readonly fileService: FileService<SourcingRecordsSheets>,
    protected readonly geoCodingService: GeoCodingAbstractClass,
    protected readonly tasksService: TasksService,
    protected readonly indicatorService: IndicatorsService,
    protected readonly impactService: ImpactService,
    protected readonly impactCalculator: ImpactCalculator,
    protected readonly excelValidator: ExcelValidatorService,
    protected readonly dbCleaner: SourcingDataDbCleaner,
  ) {}

  async importSourcingData(filePath: string, taskId: string): Promise<any> {
    this.logger.log(`Starting import process`);
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedXLSXDataset: SourcingRecordsSheets =
        await this.fileService.transformToJson(filePath, SHEETS_MAP);

      const { data: dtoMatchedData, validationErrors } =
        await this.excelValidator.validate(
          parsedXLSXDataset as unknown as SourcingDataSheet,
        );
      if (validationErrors.length) {
        throw new ExcelValidationError('Validation Errors', validationErrors);
      }

      //TODO: Implement transactional import. Move geocoding to first step

      await this.dbCleaner.cleanDataBeforeImport();

      const materials: Material[] =
        await this.materialService.findAllUnpaginated();
      if (!materials.length) {
        throw new ServiceUnavailableException(
          'No Materials found present in the DB. Please check the LandGriffon installation manual',
        );
      }
      this.logger.log('Activating Indicators...');
      const activeIndicators: Indicator[] =
        await this.indicatorService.activateIndicators(
          dtoMatchedData.indicators,
        );
      this.logger.log('Activating Materials...');
      const activeMaterials: Material[] =
        await this.materialService.activateMaterials(dtoMatchedData.materials);

      await this.tasksService.updateImportTask({
        taskId,
        newLogs: [
          `Activated indicators: ${activeIndicators
            .map((i: Indicator) => i.name)
            .join(', ')}`,
          `Activated materials: ${activeMaterials
            .map((i: Material) => i.hsCodeId)
            .join(', ')}`,
        ],
      });

      const businessUnits: BusinessUnit[] =
        await this.businessUnitService.createTree(dtoMatchedData.businessUnits);

      const suppliers: Supplier[] = await this.supplierService.createTree(
        dtoMatchedData.suppliers,
      );

      const { geoCodedSourcingData, errors } =
        await this.geoCodingService.geoCodeLocations(
          dtoMatchedData.sourcingData,
        );
      if (errors.length) {
        throw new GeoCodingError(
          'Import failed. There are GeoCoding errors present in the file',
          errors,
        );
      }
      const warnings: string[] = [];
      geoCodedSourcingData.forEach((elem: SourcingData) => {
        if (elem.locationWarning) warnings.push(elem.locationWarning);
      });
      warnings.length > 0 &&
        (await this.tasksService.updateImportTask({
          taskId,
          newLogs: warnings,
        }));

      const sourcingDataWithOrganizationalEntities: SourcingLocation[] =
        await this.relateSourcingDataWithOrganizationalEntities(
          suppliers,
          businessUnits,
          materials,
          geoCodedSourcingData,
        );

      await this.sourcingLocationService.save(
        sourcingDataWithOrganizationalEntities,
      );

      this.logger.log('Generating Indicator Records...');

      // TODO: Current approach calculates Impact for all Sourcing Records present in the DB
      //       Getting H3 data for calculations is done within DB so we need to improve the error handling
      //       TBD: What to do when there is no H3 for a Material

      try {
        await this.impactCalculator.calculateImpactForAllSourcingRecords(
          activeIndicators,
        );
        this.logger.log('Indicator Records generated');
        await this.impactService.updateImpactView();
      } catch (err: any) {
        this.logger.error(err);
        throw new ServiceUnavailableException(
          'Could not calculate Impact for current data. Please contact with the administrator',
        );
      }
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }

  /**
   * @note: Type hack as mpath property does not exist on Materials and BusinessUnits, but its created
   * by typeorm when using @Tree('materialized-path)'.
   * It's what we can use to know which material/business unit relates to which sourcing-location
   * in a synchronous way avoiding hitting the DB
   */
  async relateSourcingDataWithOrganizationalEntities(
    suppliers: Supplier[],
    businessUnits: Record<string, any>[],
    materials: Material[],
    sourcingData: SourcingData[],
  ): Promise<SourcingLocation[]> {
    this.logger.log(`Relating sourcing data with organizational entities`);
    this.logger.log(`Supplier count: ${suppliers.length}`);
    this.logger.log(`Business Units count: ${businessUnits.length}`);
    this.logger.log(`Materials count: ${materials.length}`);
    this.logger.log(`Sourcing Data count: ${sourcingData.length}`);

    const materialMap: Record<string, string> = {};
    materials.forEach((material: Material) => {
      if (!material.hsCodeId) {
        return;
      }
      materialMap[material.hsCodeId] = material.id;
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

      const sourcingLocationMaterialId: string = sourcingLocation.materialId;

      if (!(sourcingLocationMaterialId in materialMap)) {
        throw new Error(
          `Could not import sourcing location - material code ${sourcingLocationMaterialId} not found`,
        );
      }
      sourcingLocation.materialId = materialMap[sourcingLocationMaterialId];
    }
    return sourcingData as SourcingLocation[];
  }
}
