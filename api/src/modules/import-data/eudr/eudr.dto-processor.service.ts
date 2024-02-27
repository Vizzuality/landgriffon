import {
  BadRequestException,
  Injectable,
  Logger,
  ValidationError,
} from '@nestjs/common';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingDataExcelValidator } from 'modules/import-data/sourcing-data/validators/sourcing-data.class.validator';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
// @ts-ignore
import * as wellknown from 'wellknown';
import { DataSource, Repository } from 'typeorm';

/**
 * @debt: Define a more accurate DTO / Interface / Class for API-DB trades
 * and spread through typing
 */
export interface SourcingData extends CreateSourcingLocationDto {
  sourcingRecords: SourcingRecord[] | { year: number; tonnage: number }[];
  geoRegionId?: string;
  adminRegionId?: string;
}

export interface EudrInputShape {
  plot_id: string;
  plot_name: string;
  company_id: string;
  company_name: string;
  total_area_ha: number;
  sourcing_country: string;
  sourcing_district: string;
  path_id: string;
  material_id: string;
  geometry: string;

  [key: string]: string | number | undefined;
}

@Injectable()
export class EUDRDTOProcessor {
  protected readonly logger: Logger = new Logger(EUDRDTOProcessor.name);

  constructor(private readonly dataSource: DataSource) {}

  async save(
    importData: EudrInputShape[],
    sourcingLocationGroupId?: string,
  ): Promise<{
    sourcingLocations: SourcingLocation[];
  }> {
    this.logger.debug(`Creating DTOs from sourcing records sheets`);
    const sourcingLocations: SourcingLocation[] = [];
    const supplierRepository: Repository<Supplier> =
      this.dataSource.getRepository(Supplier);
    const geoRegionRepository: Repository<GeoRegion> =
      this.dataSource.getRepository(GeoRegion);
    for (const row of importData) {
      const supplier: Supplier = new Supplier();
      let savedSupplier: Supplier;
      supplier.name = row.company_name;
      supplier.description = row.company_name;
      supplier.companyId = row.company_id;
      const foundSupplier: Supplier | null = await supplierRepository.findOne({
        where: { name: supplier.name },
      });
      if (!foundSupplier) {
        savedSupplier = await supplierRepository.save(supplier);
      } else {
        savedSupplier = foundSupplier;
      }
      const geoRegion: GeoRegion = new GeoRegion();
      let savedGeoRegion: GeoRegion;
      geoRegion.totalArea = row.total_area_ha;
      geoRegion.theGeom = wellknown.parse(row.geometry) as unknown as JSON;
      geoRegion.isCreatedByUser = true;
      const foundGeoRegion: GeoRegion | null =
        await geoRegionRepository.findOne({
          where: { name: geoRegion.name },
        });
      if (!foundGeoRegion) {
        savedGeoRegion = await geoRegionRepository.save(geoRegion);
      } else {
        savedGeoRegion = foundGeoRegion;
      }
      const sourcingLocation: SourcingLocation = new SourcingLocation();
      sourcingLocation.locationType = LOCATION_TYPES.EUDR;
      sourcingLocation.locationCountryInput = row.sourcing_country;
      sourcingLocation.locationAddressInput = row.sourcing_district;
      // TODO: materialId is coming like mpath, this is an error in the input file
      sourcingLocation.materialId = row.material_id
        .split('.')
        .filter(Boolean)
        .pop() as string;
      sourcingLocation.producer = savedSupplier;
      sourcingLocation.geoRegion = savedGeoRegion;
      sourcingLocation.sourcingRecords = [];

      for (const key in row) {
        const sourcingRecord: SourcingRecord = new SourcingRecord();
        if (row.hasOwnProperty(key)) {
          const match: RegExpMatchArray | null = key.match(/^(\d{4})_t$/);
          if (match) {
            sourcingRecord.year = parseInt(match[1]);
            sourcingRecord.tonnage = row[key] as number;
            sourcingLocation.sourcingRecords.push(sourcingRecord);
          }
        }
      }
      sourcingLocations.push(sourcingLocation);
    }

    const saved: SourcingLocation[] = await this.dataSource
      .getRepository(SourcingLocation)
      .save(sourcingLocations);

    /**
     * Validating parsed and cleaned from Sourcing Data sheet
     */

    return {
      sourcingLocations: saved,
    };
  }

  private async validateCleanData(nonEmptyData: SourcingData[]): Promise<void> {
    const excelErrors: {
      line: number;
      column: string;
      errors: { [type: string]: string } | undefined;
    }[] = [];

    for (const [index, dto] of nonEmptyData.entries()) {
      const objectToValidate: SourcingDataExcelValidator = plainToClass(
        SourcingDataExcelValidator,
        dto,
      );

      try {
        await validateOrReject(objectToValidate);
      } catch (errors: any) {
        errors.forEach((error: ValidationError) => {
          if (error.children?.length) {
            error.children.forEach((nestedError: ValidationError) => {
              excelErrors.push({
                line: index + 5,
                column: nestedError.value.year,
                errors: nestedError.children?.[0].constraints,
              });
            });
          } else {
            excelErrors.push({
              line: index + 5,
              column: error?.property,
              errors: error?.constraints,
            });
          }
        });
      }
    }

    if (excelErrors.length) {
      throw new BadRequestException(excelErrors);
    }
  }
}
