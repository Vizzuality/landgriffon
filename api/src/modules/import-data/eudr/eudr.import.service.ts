import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { SourcingRecordsDtos } from 'modules/import-data/sourcing-data/dto-processor.service';

import { SourcingRecordsSheets } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import { FileService } from 'modules/import-data/file.service';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { TasksService } from 'modules/tasks/tasks.service';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { validateOrReject } from 'class-validator';
import { EUDRDTOProcessor } from 'modules/import-data/eudr/eudr.dto-processor.service';

const EUDR_SHEET_MAP: Record<'Data', 'Data'> = {
  Data: 'Data',
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
    protected readonly dtoProcessor: EUDRDTOProcessor,
    protected readonly geoCodingService: GeoCodingAbstractClass,
    protected readonly tasksService: TasksService,
    protected readonly scenarioService: ScenariosService,
    protected readonly indicatorService: IndicatorsService,
    protected readonly indicatorRecordService: IndicatorRecordsService,
  ) {}

  async importEudr(filePath: string, taskId: string): Promise<any> {
    this.logger.log(`Starting eudr import process`);
    await this.fileService.isFilePresentInFs(filePath);
    try {
      const parsedEudrData: any = await this.fileService.transformToJson(
        filePath,
        EUDR_SHEET_MAP,
      );

      const sourcingLocationGroup: SourcingLocationGroup =
        await this.sourcingLocationGroupService.create({
          title: 'Sourcing Records import from EUDR input file',
        });

      await this.cleanDataBeforeImport();

      // TODO: Check what do we need to do with indicators and specially materials:
      //  Do we need to ingest new materials? Activate some through the import? Activate all?

      const { sourcingLocations } = await this.dtoProcessor.save(
        parsedEudrData.Data,
      );

      return sourcingLocations;
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
    } catch (e: any) {
      throw new Error(
        `Database could not been cleaned before loading new dataset: ${e.message}`,
      );
    }
  }
}
