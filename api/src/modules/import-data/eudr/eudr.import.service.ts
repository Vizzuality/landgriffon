import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SourcingLocationGroup } from '../../sourcing-location-groups/sourcing-location-group.entity';
import {
  SourcingData,
  SourcingRecordsDtoProcessorService,
  SourcingRecordsDtos,
} from '../sourcing-data/dto-processor.service';
import { Material } from '../../materials/material.entity';
import { Indicator } from '../../indicators/indicator.entity';
import { BusinessUnit } from '../../business-units/business-unit.entity';
import { Supplier } from '../../suppliers/supplier.entity';
import { SourcingRecordsSheets } from '../sourcing-data/sourcing-data-import.service';
import { FileService } from '../file.service';
import { SourcingLocationGroupsService } from '../../sourcing-location-groups/sourcing-location-groups.service';
import { MaterialsService } from '../../materials/materials.service';
import { BusinessUnitsService } from '../../business-units/business-units.service';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { AdminRegionsService } from '../../admin-regions/admin-regions.service';
import { GeoRegionsService } from '../../geo-regions/geo-regions.service';
import { SourcingLocationsService } from '../../sourcing-locations/sourcing-locations.service';
import { SourcingRecordsService } from '../../sourcing-records/sourcing-records.service';
import { GeoCodingAbstractClass } from '../../geo-coding/geo-coding-abstract-class';
import { TasksService } from '../../tasks/tasks.service';
import { ScenariosService } from '../../scenarios/scenarios.service';
import { IndicatorsService } from '../../indicators/indicators.service';
import { IndicatorRecordsService } from '../../indicator-records/indicator-records.service';
import { ImpactService } from '../../impact/impact.service';
import { ImpactCalculator } from '../../indicator-records/services/impact-calculator.service';
import { validateOrReject } from 'class-validator';

const EUDR_SHEET_MAP: Record<'data', 'Data'> = {
  data: 'Data',
};

@Injectable()
export class EudrImportService {
  logger: Logger = new Logger(EudrImportService.name);

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
    protected readonly tasksService: TasksService,
    protected readonly scenarioService: ScenariosService,
    protected readonly indicatorService: IndicatorsService,
    protected readonly indicatorRecordService: IndicatorRecordsService,
    protected readonly impactService: ImpactService,
    protected readonly impactCalculator: ImpactCalculator,
  ) {}

  async importEudr(filePath: string, taskId: string): Promise<any> {
    this.logger.log(`Starting eudr import process`);
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedEudrData: SourcingRecordsSheets =
        await this.fileService.transformToJson(filePath, EUDR_SHEET_MAP);

      const sourcingLocationGroup: SourcingLocationGroup =
        await this.sourcingLocationGroupService.create({
          title: 'Sourcing Records import from EUDR input file',
        });

      await this.cleanDataBeforeImport();

      return parsedEudrData;

      // const dtoMatchedData: SourcingRecordsDtos =
      //   await this.validateAndCreateDTOs(
      //     parsedXLSXDataset,
      //     sourcingLocationGroup.id,
      //   ).catch(async (err: any) => {
      //     await this.tasksService.updateImportTask({
      //       taskId,
      //       newErrors: err.message,
      //     });
      //     throw new BadRequestException(
      //       'Import failed. There are constraint errors present in the file',
      //     );
      //   });

      //TODO: Implement transactional import. Move geocoding to first step
      //
      //   const materials: Material[] =
      //     await this.materialService.findAllUnpaginated();
      //   if (!materials.length) {
      //     throw new ServiceUnavailableException(
      //       'No Materials found present in the DB. Please check the LandGriffon installation manual',
      //     );
      //   }
      //   this.logger.log('Activating Indicators...');
      //   const activeIndicators: Indicator[] =
      //     await this.indicatorService.activateIndicators(
      //       dtoMatchedData.indicators,
      //     );
      //   this.logger.log('Activating Materials...');
      //   const activeMaterials: Material[] =
      //     await this.materialService.activateMaterials(dtoMatchedData.materials);
      //
      //   await this.tasksService.updateImportTask({
      //     taskId,
      //     newLogs: [
      //       `Activated indicators: ${activeIndicators
      //         .map((i: Indicator) => i.name)
      //         .join(', ')}`,
      //       `Activated materials: ${activeMaterials
      //         .map((i: Material) => i.hsCodeId)
      //         .join(', ')}`,
      //     ],
      //   });
      //
      //   const businessUnits: BusinessUnit[] =
      //     await this.businessUnitService.createTree(dtoMatchedData.businessUnits);
      //
      //   const suppliers: Supplier[] = await this.supplierService.createTree(
      //     dtoMatchedData.suppliers,
      //   );
      //
      //   const { geoCodedSourcingData, errors } =
      //     await this.geoCodingService.geoCodeLocations(
      //       dtoMatchedData.sourcingData,
      //     );
      //   if (errors.length) {
      //     await this.tasksService.updateImportTask({ taskId, newErrors: errors });
      //     throw new BadRequestException(
      //       'Import failed. There are GeoCoding errors present in the file',
      //     );
      //   }
      //   const warnings: string[] = [];
      //   geoCodedSourcingData.forEach((elem: SourcingData) => {
      //     if (elem.locationWarning) warnings.push(elem.locationWarning);
      //   });
      //   warnings.length > 0 &&
      //     (await this.tasksService.updateImportTask({
      //       taskId,
      //       newLogs: warnings,
      //     }));
      //
      //   const sourcingDataWithOrganizationalEntities: any =
      //     await this.relateSourcingDataWithOrganizationalEntities(
      //       suppliers,
      //       businessUnits,
      //       materials,
      //       geoCodedSourcingData,
      //     );
      //
      //   await this.sourcingLocationService.save(
      //     sourcingDataWithOrganizationalEntities,
      //   );
      //
      //   this.logger.log('Generating Indicator Records...');
      //
      //   // TODO: Current approach calculates Impact for all Sourcing Records present in the DB
      //   //       Getting H3 data for calculations is done within DB so we need to improve the error handling
      //   //       TBD: What to do when there is no H3 for a Material
      //
      //   try {
      //     await this.impactCalculator.calculateImpactForAllSourcingRecords(
      //       activeIndicators,
      //     );
      //     this.logger.log('Indicator Records generated');
      //     await this.impactService.updateImpactView();
      //   } catch (err: any) {
      //     throw new ServiceUnavailableException(
      //       'Could not calculate Impact for current data. Please contact with the administrator',
      //     );
      //   }
      // } finally {
      //   await this.fileService.deleteDataFromFS(filePath);
      // }
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }

  private async validateDTOs(
    dtoLists: SourcingRecordsDtos,
  ): Promise<void | Array<ErrorConstructor>> {
    const validationErrorArray: {
      line: number;
      property: string;
      message: any;
    }[] = [];
    for (const parsedSheet in dtoLists) {
      if (dtoLists.hasOwnProperty(parsedSheet)) {
        for (const [i, dto] of dtoLists[
          parsedSheet as keyof SourcingRecordsDtos
        ].entries()) {
          try {
            await validateOrReject(dto);
          } catch (err: any) {
            validationErrorArray.push({
              line: i + 5,
              property: err[0].property,
              message: err[0].constraints,
            });
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
      throw new BadRequestException(validationErrorArray);
  }

  /**
   * @note: Deletes DB content from required entities
   * to ensure DB is prune prior loading a XLSX dataset
   */
  async cleanDataBeforeImport(): Promise<void> {
    this.logger.log('Cleaning database before import...');
    try {
      await this.indicatorService.deactivateAllIndicators();
      await this.materialService.deactivateAllMaterials();
      await this.scenarioService.clearTable();
      await this.indicatorRecordService.clearTable();
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
  async relateSourcingDataWithOrganizationalEntities(
    suppliers: Supplier[],
    businessUnits: Record<string, any>[],
    materials: Material[],
    sourcingData: SourcingData[],
  ): Promise<SourcingData[] | void> {
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
      if (typeof sourcingLocation.materialId === 'undefined') {
        return;
      }
      const sourcingLocationMaterialId: string = sourcingLocation.materialId;

      if (!(sourcingLocationMaterialId in materialMap)) {
        throw new Error(
          `Could not import sourcing location - material code ${sourcingLocationMaterialId} not found`,
        );
      }
      sourcingLocation.materialId = materialMap[sourcingLocationMaterialId];
    }
    return sourcingData;
  }

  async validateAndCreateDTOs(
    parsedXLSXDataset: SourcingRecordsSheets,
    sourcingLocationGroupId: string,
  ): Promise<SourcingRecordsDtos> {
    const dtoMatchedData: SourcingRecordsDtos =
      await this.dtoProcessor.createDTOsFromSourcingRecordsSheets(
        parsedXLSXDataset,
        sourcingLocationGroupId,
      );

    await this.validateDTOs(dtoMatchedData);
    return dtoMatchedData;
  }
}
