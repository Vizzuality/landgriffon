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
import { DataSource } from 'typeorm';
import { SourcingLocation } from '../../sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { Supplier } from '../../suppliers/supplier.entity';
import { SourcingRecord } from '../../sourcing-records/sourcing-record.entity';

const { AsyncParser } = require('@json2csv/node');
import * as fs from 'fs'; // Para tr

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
    protected readonly dataSource: DataSource,
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

      // TODO: At this point we should send the data to Carto. For now we will be creating a csv to upload
      //  and read from there

      const data: {
        supplierId: string;
        geoRegionId: string;
        geometry: string;
        year: number;
      }[] = await this.dataSource
        .createQueryBuilder()
        .select('s.id', 'supplierId')
        .addSelect('g.id', 'geoRegionId')
        .addSelect('g.theGeom', 'geometry')
        .addSelect('sr.year', 'year')
        .from(SourcingRecord, 'sr')
        .leftJoin(SourcingLocation, 'sl', 'sr.sourcingLocationId = sl.id')
        .leftJoin(GeoRegion, 'g', 'sl.geoRegionId = g.id')
        .leftJoin(Supplier, 's', 'sl.producerId = s.id')

        .execute();

      const fakedCartoOutput: any[] = data.map((row: any) =>
        this.generateFakeAlerts(row),
      );

      const parsed: any = await new AsyncParser({
        fields: [
          'geoRegionId',
          'supplierId',
          'geometry',
          'year',
          'alertDate',
          'alertConfidence',
          'alertCount',
        ],
      })
        .parse(fakedCartoOutput)
        .promise();
      try {
        await fs.promises.writeFile('fakedCartoOutput.csv', parsed);
      } catch (e: any) {
        this.logger.error(`Error writing fakedCartoOutput.csv: ${e.message}`);
      }

      return fakedCartoOutput;
    } finally {
      await this.fileService.deleteDataFromFS(filePath);
    }
  }

  private generateFakeAlerts(row: {
    geoRegionId: string;
    supplierId: string;
    geometry: string;
    year: number;
  }): any {
    const { geoRegionId, supplierId, geometry } = row;
    const alertConfidence: string = Math.random() > 0.5 ? 'high' : 'low';
    const startDate: Date = new Date(row.year, 0, 1);
    const endDate: Date = new Date(row.year, 11, 31);
    const timeDiff: number = endDate.getTime() - startDate.getTime();
    const randomDate: Date = new Date(
      startDate.getTime() + Math.random() * timeDiff,
    );
    const alertDate: string = randomDate.toISOString().split('T')[0];
    const alertCount: number = Math.floor(Math.random() * 20) + 1;
    return {
      geoRegionId,
      supplierId,
      geometry,
      alertDate,
      alertConfidence,
      alertCount,
    };
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
