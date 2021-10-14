import { Injectable, Logger } from '@nestjs/common';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { SourcingRecordsSheets } from 'modules/import-data/sourcing-data/import.service';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { WorkSheet } from 'xlsx';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

/**
 * @debt: Define a more accurate DTO / Interface / Class for API-DB trades
 * and spread through typing
 */
export interface SourcingData extends CreateSourcingLocationDto {
  materialId: string;
  sourcingRecords: SourcingRecord[];
}

export interface SourcingRecordsDtos {
  materials: CreateMaterialDto[];
  adminRegions: CreateAdminRegionDto[];
  businessUnits: CreateBusinessUnitDto[];
  suppliers: CreateSupplierDto[];
  sourcingData: SourcingData[];
}

const SOURCING_LOCATION_PROPERTIES: Array<string> = [
  'material.path',
  'business_unit.path',
  't1_supplier.name',
  'producer.name',
  'location_country_input',
  'location_address_input',
  'location_latitude_input',
  'location_longitude_input',
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
    sourcingLocationGroupId: string,
  ): Promise<SourcingRecordsDtos> {
    this.logger.debug(`Creating DTOs from sourcing records sheets`);
    const materials: CreateMaterialDto[] = await this.createMaterialDtos(
      importData.materials,
    );
    const businessUnits: CreateBusinessUnitDto[] = await this.createBusinessUnitDtos(
      importData.businessUnits,
    );
    const suppliers: CreateSupplierDto[] = await this.createSupplierDtos(
      importData.suppliers,
    );
    const adminRegions: CreateAdminRegionDto[] = await this.createAdminRegionDtos(
      importData.countries,
    );

    const processedSourcingData: Record<string, any> = this.cleanCustomData(
      importData.sourcingData,
    );
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
    };
  }
  private isSourcingLocationData(field: string): boolean {
    return SOURCING_LOCATION_PROPERTIES.includes(field);
  }

  private getYear(field: string): number | null {
    const regexMatch: RegExpMatchArray | null = field.match(/\d{4}_/gm);

    return regexMatch ? parseInt(regexMatch[0]) : null;
  }

  private cleanCustomData(
    customData: WorkSheet[],
  ): { sourcingData: SourcingData[] } {
    this.logger.debug(`Cleaning ${customData.length} custom data rows`);

    const sourcingData: SourcingData[] = [];

    /**
     * Clean all hashmaps that are empty therefore useless
     */
    const nonEmptyData = customData.filter(
      (row: WorkSheet) =>
        row['material.path'] !== '' && !Object.values(row).includes('#N/A'),
    );

    this.logger.debug(
      `Found ${nonEmptyData.length} non-empty custom data rows`,
    );

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

      const sourcingLocationWithSourcingRecords = {
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
    importData.forEach((importRow: Record<string, any>) => {
      materialList.push(this.createMaterialDTOFromData(importRow));
    });
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
    importData.forEach((importRow: Record<string, any>) => {
      businessUnitDtos.push(this.createBusinessUnitDTOFromData(importRow));
    });
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
    importData.forEach((importRow: Record<string, any>) => {
      supplierDtos.push(this.crateSuppliersDTOFromData(importRow));
    });
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
    importData.forEach((importRow: Record<string, any>) => {
      adminRegionDtos.push(this.createAdminRegionDTOFromData(importRow));
    });
    return adminRegionDtos;
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
    sourcingLocationGroupId: string,
  ): Promise<SourcingData[]> {
    this.logger.debug(
      `Creating sourcing data DTOs from ${importData.length} data rows`,
    );

    const sourcingLocationDtos: any[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      const sourcingLocationDto = this.createSourcingLocationDTOFromData(
        importRow,
        sourcingLocationGroupId,
      );
      const sourcingRecords: CreateSourcingRecordDto[] = importRow.sourcingRecords.map(
        (sourcingRecord: CreateSourcingRecordDto) => {
          return this.createSourcingRecordDTOFromData(sourcingRecord);
        },
      );
      sourcingLocationDtos.push({
        ...sourcingLocationDto,
        sourcingRecords,
      });
    });

    this.logger.debug(
      `Created ${sourcingLocationDtos.length} sourcing location DTOs`,
    );

    return sourcingLocationDtos;
  }

  private createMaterialDTOFromData(materialData: Record<string, any>): any {
    const materialDto = new CreateMaterialDto();
    materialDto.name = materialData.name;
    materialDto.description = materialData.description;
    materialDto.hsCodeId = materialData.hs_2017_code;
    materialDto.mpath = materialData.path_id;
    materialDto.datasetId = materialData.datasetId;
    return materialDto;
  }

  private createBusinessUnitDTOFromData(
    businessUnitData: Record<string, any>,
  ): CreateBusinessUnitDto {
    const businessUnitDto = new CreateBusinessUnitDto();
    businessUnitDto.name = businessUnitData.name;
    businessUnitDto.description = businessUnitData.description;
    businessUnitDto.mpath = businessUnitData.path_id;
    return businessUnitDto;
  }

  private crateSuppliersDTOFromData(
    supplierData: Record<string, any>,
  ): CreateSupplierDto {
    const suppliersDto = new CreateSupplierDto();
    suppliersDto.name = supplierData.name;
    suppliersDto.description = supplierData.description;
    suppliersDto.mpath = supplierData.path_id;
    return suppliersDto;
  }

  private createAdminRegionDTOFromData(
    adminRegionData: Record<string, any>,
  ): CreateAdminRegionDto {
    const adminRegionDto = new CreateAdminRegionDto();
    adminRegionDto.name = adminRegionData.name;
    adminRegionDto.isoA3 = adminRegionData.iso_a3;
    adminRegionDto.isoA2 = adminRegionData.iso_a2;
    return adminRegionDto;
  }

  private createSourcingLocationDTOFromData(
    sourcingLocationData: Record<string, any>,
    sourcingLocationGroupId: string,
  ): CreateSourcingLocationDto {
    const sourcingLocationDto = new CreateSourcingLocationDto();
    sourcingLocationDto.locationType = sourcingLocationData.location_type;
    sourcingLocationDto.locationCountryInput =
      sourcingLocationData.location_country_input;
    sourcingLocationDto.locationAddressInput =
      sourcingLocationData.location_address_input === ''
        ? undefined
        : sourcingLocationData.location_address_input;
    sourcingLocationDto.locationLatitude =
      sourcingLocationData.location_latitude_input === ''
        ? undefined
        : parseFloat(sourcingLocationData.location_latitude_input);
    sourcingLocationDto.locationLongitude =
      sourcingLocationData.location_longitude_input === ''
        ? undefined
        : parseFloat(sourcingLocationData.location_longitude_input);
    sourcingLocationDto.metadata = sourcingLocationData.metadata;
    sourcingLocationDto.sourcingLocationGroupId = sourcingLocationGroupId;
    sourcingLocationDto.businessUnitId =
      sourcingLocationData['business_unit.path'];
    sourcingLocationDto.materialId = sourcingLocationData['material.path'];
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

  private createSourcingRecordDTOFromData(
    sourcingRecordData: Record<string, any>,
  ): CreateSourcingRecordDto {
    const sourcingRecordDto = new CreateSourcingRecordDto();
    sourcingRecordDto.tonnage = sourcingRecordData.tonnage;
    sourcingRecordDto.year = sourcingRecordData.year;
    return sourcingRecordDto;
  }
}
