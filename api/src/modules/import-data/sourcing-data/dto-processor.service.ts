import {
  BadRequestException,
  Injectable,
  Logger,
  ValidationError,
} from '@nestjs/common';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { SourcingRecordsSheets } from 'modules/import-data/sourcing-data/sourcing-records-sheets.interface';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { WorkSheet } from 'xlsx';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingDataExcelValidator } from 'modules/import-data/sourcing-data/validators/sourcing-data.class.validator';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { replaceStringWhiteSpacesWithDash } from 'utils/transform-location-type.util';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

/**
 * @debt: Define a more accurate DTO / Interface / Class for API-DB trades
 * and spread through typing
 */
export interface SourcingData extends CreateSourcingLocationDto {
  sourcingRecords: SourcingRecord[] | { year: number; tonnage: number }[];
  geoRegionId?: string;
  adminRegionId?: string;
}

export interface SourcingRecordsDtos {
  materials: CreateMaterialDto[];
  adminRegions: CreateAdminRegionDto[];
  businessUnits: CreateBusinessUnitDto[];
  suppliers: CreateSupplierDto[];
  indicators: CreateIndicatorDto[];
  sourcingData: SourcingData[];
}

const SOURCING_LOCATION_SHEET_PROPERTIES: Array<string> = [
  'material.hsCode',
  'business_unit.path',
  't1_supplier.name',
  'producer.name',
  'location_country_input',
  'location_address_input',
  'location_latitude_input',
  'location_longitude_input',
  'location_admin_region_input',
  'location_type',
  'material.path',
  'business_unit.path',
  't1_supplier.name',
  'producer.name',
];

/**
 *
 * @note:
 * In order to class-validator validate the DTOs, a new DTO / Entity instance (where
 * class-validator decorators are set) needs to be created
 * Otherwise class-validator's validation service has no awareness of said validations
 */

@Injectable()
export class SourcingRecordsDtoProcessorService {
  protected readonly logger: Logger = new Logger(
    SourcingRecordsDtoProcessorService.name,
  );

  async createDTOsFromSourcingRecordsSheets(
    importData: SourcingRecordsSheets,
    sourcingLocationGroupId?: string,
  ): Promise<SourcingRecordsDtos> {
    this.logger.debug(`Creating DTOs from sourcing records sheets`);
    const materials: CreateMaterialDto[] = await this.createMaterialDtos(
      importData.materials,
    );
    const businessUnits: CreateBusinessUnitDto[] =
      await this.createBusinessUnitDtos(importData.businessUnits);
    const suppliers: CreateSupplierDto[] = await this.createSupplierDtos(
      importData.suppliers,
    );
    const adminRegions: CreateAdminRegionDto[] =
      await this.createAdminRegionDtos(importData.countries);

    const indicators: CreateIndicatorDto[] = await this.createIndicatorDtos(
      importData.indicators,
    );

    const processedSourcingData: Record<string, any> =
      await this.cleanCustomData(importData.sourcingData);

    /**
     * Validating parsed and cleaned from Sourcing Data sheet
     */

    await this.validateCleanData(processedSourcingData.sourcingData);
    /**
     * Builds SourcingData from parsed XLSX
     */
    const sourcingData: SourcingData[] = await this.createSourcingDataDTOs(
      processedSourcingData.sourcingData,
      sourcingLocationGroupId,
    );
    return {
      materials,
      businessUnits,
      suppliers,
      adminRegions,
      sourcingData,
      indicators,
    };
  }

  private isSourcingLocationData(field: string): boolean {
    return SOURCING_LOCATION_SHEET_PROPERTIES.includes(field);
  }

  private getYear(field: string): number | null {
    const regexMatch: RegExpMatchArray | null = field.match(/\d{4}_/gm);

    return regexMatch ? parseInt(regexMatch[0]) : null;
  }

  private async cleanCustomData(customData: WorkSheet[]): Promise<{
    sourcingData: SourcingData[];
  }> {
    this.logger.debug(`Cleaning ${customData.length} custom data rows`);
    const sourcingData: SourcingData[] = [];

    /**
     * Clean all hashmaps that are empty therefore useless
     */
    const nonEmptyData: WorkSheet[] = customData.filter(
      (row: WorkSheet) =>
        row['material.hsCode'] && row['material.hsCode'] !== '',
    );
    this.logger.debug(`Found ${customData.length} non-empty custom data rows`);
    /**
     * Separate base properties common for each sourcing-location row
     * Separate metadata properties to metadata object common for each sourcing-location row
     * Check if current key contains a year ('2018_tonnage') if so, get the year and its value
     */

    for (const eachRecordOfCustomData of nonEmptyData) {
      const sourcingRecords: Record<string, any>[] = [];
      const years: Record<string, any> = {};
      const baseProps: Record<string, any> = {};
      const metadata: Record<string, any> = {};
      const sourcingLocation: Record<string, any> = {};
      for (const field in eachRecordOfCustomData) {
        if (
          eachRecordOfCustomData.hasOwnProperty(field) &&
          this.getYear(field)
        ) {
          years[field] = eachRecordOfCustomData[field];
        } else if (this.isSourcingLocationData(field)) {
          sourcingLocation[field] = eachRecordOfCustomData[field];
        } else if (!this.isSourcingLocationData(field)) {
          metadata[field] = eachRecordOfCustomData[field];
        } else {
          eachRecordOfCustomData[field] === ' '
            ? (baseProps[field] = null)
            : (baseProps[field] = eachRecordOfCustomData[field]);
        }
      }
      /**
       * For each year, spread the base properties and attach metadata
       * to build each sourcing-record row
       */
      for (const year in years) {
        if (years.hasOwnProperty(year)) {
          const cleanRow: any = {
            ...baseProps,
          };
          cleanRow['year'] = this.getYear(year);
          cleanRow['tonnage'] = years[year];
          sourcingRecords.push(cleanRow);
        }
      }
      /**
       * For each SourcingLocation, attach belonging sourcing-data to have awareness
       * of their relationship
       */

      const sourcingLocationWithSourcingRecords: {
        [p: string]: any;
        metadata: Record<string, any>;
        sourcingRecords: Record<string, any>[];
      } = {
        ...sourcingLocation,
        sourcingRecords,
        metadata,
      };
      sourcingData.push(sourcingLocationWithSourcingRecords as SourcingData);
    }

    return { sourcingData };
  }

  /**
   * Creates an array of CreateMaterialDto objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @private
   */
  private async createMaterialDtos(
    importData: Record<string, any>[],
  ): Promise<CreateMaterialDto[]> {
    const materialList: CreateMaterialDto[] = [];
    for (const importRow of importData) {
      materialList.push(await this.createMaterialDTOFromData(importRow));
    }
    return materialList;
  }

  /**
   * Creates an array of CreateBusinessUnitDto objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @private
   */
  private async createBusinessUnitDtos(
    importData: Record<string, any>[],
  ): Promise<CreateBusinessUnitDto[]> {
    const businessUnitDtos: CreateBusinessUnitDto[] = [];
    for (const importRow of importData) {
      businessUnitDtos.push(
        await this.createBusinessUnitDTOFromData(importRow),
      );
    }

    return businessUnitDtos;
  }

  /**
   * Creates an array of CreateSupplierDto objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @private
   */
  private async createSupplierDtos(
    importData: Record<string, any>[],
  ): Promise<CreateSupplierDto[]> {
    const supplierDtos: CreateSupplierDto[] = [];
    for (const importRow of importData) {
      supplierDtos.push(await this.crateSuppliersDTOFromData(importRow));
    }

    return supplierDtos;
  }

  /**
   * Creates an array of CreateAdminRegionDto objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @private
   */
  private async createAdminRegionDtos(
    importData: Record<string, any>[],
  ): Promise<CreateAdminRegionDto[]> {
    const adminRegionDtos: CreateAdminRegionDto[] = [];
    for (const importRow of importData) {
      adminRegionDtos.push(await this.createAdminRegionDTOFromData(importRow));
    }
    return adminRegionDtos;
  }

  private async createIndicatorDtos(
    importData: Record<string, any>[],
  ): Promise<CreateIndicatorDto[]> {
    const indicatorsDtos: CreateIndicatorDto[] = [];
    for (const importRow of importData) {
      indicatorsDtos.push(await this.createIndicatorDTOFromData(importRow));
    }
    return indicatorsDtos;
  }

  /**
   * Creates an array of SourcingLocation and nested SourcingRecord objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @param sourcingLocationGroupId
   * @private
   */
  private async createSourcingDataDTOs(
    importData: Record<string, any>[],
    sourcingLocationGroupId?: string,
  ): Promise<SourcingData[]> {
    this.logger.debug(
      `Creating sourcing data DTOs from ${importData.length} data rows`,
    );

    const sourcingLocationDtos: any[] = [];
    for (const importRow of importData) {
      const sourcingLocationDto: CreateSourcingLocationDto =
        await this.createSourcingLocationDTOFromData(
          importRow,
          sourcingLocationGroupId,
        );
      const sourcingRecords: CreateSourcingRecordDto[] =
        importRow.sourcingRecords.map(
          async (sourcingRecord: CreateSourcingRecordDto) => {
            return await this.createSourcingRecordDTOFromData(sourcingRecord);
          },
        );
      sourcingLocationDtos.push({
        ...sourcingLocationDto,
        sourcingRecords,
      });
    }
    this.logger.debug(
      `Created ${sourcingLocationDtos.length} sourcing location DTOs`,
    );

    return sourcingLocationDtos;
  }

  private async createMaterialDTOFromData(
    materialData: Record<string, any>,
  ): Promise<CreateMaterialDto> {
    const materialDto: CreateMaterialDto = new CreateMaterialDto();
    materialDto.name = materialData.name;
    materialDto.description = materialData.description;
    materialDto.hsCodeId = materialData.hs_2017_code;
    materialDto.mpath = materialData.path_id;
    materialDto.datasetId = materialData.datasetId;
    materialDto.status = materialData.status;
    return materialDto;
  }

  private async createBusinessUnitDTOFromData(
    businessUnitData: Record<string, any>,
  ): Promise<CreateBusinessUnitDto> {
    const businessUnitDto: CreateBusinessUnitDto = new CreateBusinessUnitDto();
    businessUnitDto.name = businessUnitData.name;
    businessUnitDto.description = businessUnitData.description;
    businessUnitDto.mpath = businessUnitData.path_id;
    return businessUnitDto;
  }

  private async crateSuppliersDTOFromData(
    supplierData: Record<string, any>,
  ): Promise<CreateSupplierDto> {
    const suppliersDto: CreateSupplierDto = new CreateSupplierDto();
    suppliersDto.name = supplierData.name;
    suppliersDto.description = supplierData.description;
    suppliersDto.mpath = supplierData.path_id;
    return suppliersDto;
  }

  private async createAdminRegionDTOFromData(
    adminRegionData: Record<string, any>,
  ): Promise<CreateAdminRegionDto> {
    const adminRegionDto: CreateAdminRegionDto = new CreateAdminRegionDto();
    adminRegionDto.name = adminRegionData.name;
    adminRegionDto.isoA3 = adminRegionData.iso_a3;
    adminRegionDto.isoA2 = adminRegionData.iso_a2;
    return adminRegionDto;
  }

  private createIndicatorDTOFromData(
    indicatorData: Record<string, any>,
  ): CreateIndicatorDto {
    const indicatorDto: CreateIndicatorDto = new CreateIndicatorDto();
    indicatorDto.name = indicatorData.name;
    indicatorDto.nameCode = indicatorData.nameCode;
    indicatorDto.status = indicatorData.status;
    return indicatorDto;
  }

  private async createSourcingLocationDTOFromData(
    sourcingLocationData: Record<string, any>,
    sourcingLocationGroupId?: string,
  ): Promise<CreateSourcingLocationDto> {
    const sourcingLocationDto: CreateSourcingLocationDto =
      new CreateSourcingLocationDto();
    sourcingLocationDto.locationType = replaceStringWhiteSpacesWithDash(
      sourcingLocationData.location_type,
    ) as LOCATION_TYPES;
    sourcingLocationDto.locationCountryInput =
      sourcingLocationData.location_country_input;
    sourcingLocationDto.locationAddressInput =
      sourcingLocationData.location_address_input === ''
        ? undefined
        : sourcingLocationData.location_address_input;
    sourcingLocationDto.locationAdminRegionInput =
      sourcingLocationData.location_admin_region_input === ''
        ? undefined
        : sourcingLocationData.location_admin_region_input;
    sourcingLocationDto.locationLatitude =
      sourcingLocationData.location_latitude_input === ''
        ? undefined
        : parseFloat(sourcingLocationData.location_latitude_input);
    sourcingLocationDto.locationLongitude =
      sourcingLocationData.location_longitude_input === ''
        ? undefined
        : parseFloat(sourcingLocationData.location_longitude_input);
    sourcingLocationDto.metadata = sourcingLocationData.metadata;
    sourcingLocationDto.sourcingLocationGroupId = !sourcingLocationGroupId
      ? undefined
      : sourcingLocationGroupId;
    sourcingLocationDto.businessUnitId =
      sourcingLocationData['business_unit.path'];
    sourcingLocationDto.materialId = sourcingLocationData['material.hsCode'];
    sourcingLocationDto.producerId =
      sourcingLocationData['producer.name'] === ''
        ? undefined
        : sourcingLocationData['producer.name'];
    sourcingLocationDto.t1SupplierId =
      sourcingLocationData['t1_supplier.name'] === ''
        ? undefined
        : sourcingLocationData['t1_supplier.name'];
    return sourcingLocationDto;
  }

  private async createSourcingRecordDTOFromData(
    sourcingRecordData: Record<string, any>,
  ): Promise<CreateSourcingRecordDto> {
    const sourcingRecordDto: CreateSourcingRecordDto =
      new CreateSourcingRecordDto();
    sourcingRecordDto.tonnage = sourcingRecordData.tonnage;
    sourcingRecordDto.year = sourcingRecordData.year;
    return sourcingRecordDto;
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
                line: index + 2,
                column: nestedError.value.year,
                errors: nestedError.children?.[0].constraints,
              });
            });
          } else {
            excelErrors.push({
              line: index + 2,
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
