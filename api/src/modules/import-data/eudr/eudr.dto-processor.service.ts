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
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';

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
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.debug(`Creating DTOs from sourcing records sheets`);
      const sourcingLocations: SourcingLocation[] = [];
      const supplierRepository: Repository<Supplier> =
        queryRunner.manager.getRepository(Supplier);
      const geoRegionRepository: Repository<GeoRegion> =
        queryRunner.manager.getRepository(GeoRegion);
      for (const row of importData) {
        const supplier: Supplier = new Supplier();
        let savedSupplier: Supplier;
        supplier.name = row.company_name;
        supplier.description = row.company_name;
        supplier.companyId = row.company_id;
        const foundSupplier: Supplier | null = await supplierRepository.findOne(
          {
            where: { name: supplier.name },
          },
        );
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
        geoRegion.name = row.plot_name;
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
        sourcingLocation.adminRegionId = row.sourcing_district
          ? await this.getAdminRegionByAddress(
              queryRunner,
              row.sourcing_district,
              row.geometry,
            )
          : (null as unknown as string);

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

      const saved: SourcingLocation[] = await queryRunner.manager
        .getRepository(SourcingLocation)
        .save(sourcingLocations);

      await queryRunner.commitTransaction();
      return {
        sourcingLocations: saved,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async getAdminRegionByAddress(
    queryRunner: QueryRunner,
    name: string,
    geom: string,
  ): Promise<string> {
    const adminRegion: AdminRegion | null = await queryRunner.manager
      .getRepository(AdminRegion)
      .findOne({ where: { name: name, level: 1 } });
    if (!adminRegion) {
      this.logger.warn(
        `No admin region found for the provided address: ${name}`,
      );
      return this.getAdminRegionByIntersection(queryRunner, geom);
    }
    return adminRegion.id;
  }

  // TODO: temporal method to determine the most accurate admin region. For now we only consider Level 0
  //  as Country and Level 1 as district

  private async getAdminRegionByIntersection(
    queryRunner: QueryRunner,
    geometry: string,
  ): Promise<string> {
    this.logger.log(`Intersecting EUDR geometry...`);

    const adminRegions: any = await queryRunner.manager.query(
      `
    WITH intersections AS (
        SELECT
        ar.id,
        ar.name,
        ar."geoRegionId",
        gr."theGeom",
        ar.level,
        ST_Area(ST_Intersection(gr."theGeom", ST_GeomFromEWKT('SRID=4326;${geometry}'))) AS intersection_area
    FROM admin_region ar
    JOIN geo_region gr ON ar."geoRegionId" = gr.id
    WHERE
        ST_Intersects(gr."theGeom", ST_GeomFromEWKT('SRID=4326;${geometry}'))
    AND ar.level IN (0, 1)
    ),
    max_intersection_by_level AS (
    SELECT
    level,
    MAX(intersection_area) AS max_area
    FROM intersections
    GROUP BY level
    )
    SELECT i.*
    FROM intersections i
    JOIN max_intersection_by_level m ON i.level = m.level AND i.intersection_area = m.max_area;
    `,
    );
    if (!adminRegions.length) {
      throw new GeoCodingError(
        `No admin region found for the provided geometry`,
      );
    }

    const level1AdminRegionid: string = adminRegions.find(
      (ar: any) => ar.level === 1,
    ).id;
    this.logger.log('Admin region found');
    return level1AdminRegionid;
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
