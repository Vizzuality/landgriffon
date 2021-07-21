import { Injectable } from '@nestjs/common';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { SourcingRecordsSheets } from 'modules/import-data/sourcing-records/import.service';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { isEmpty } from 'lodash';
import { Layer } from 'modules/layers/layer.entity';
import { WorkSheet } from 'xlsx';

export interface SourcingRecordsDtos {
  materials: CreateMaterialDto[];
  adminRegions: CreateAdminRegionDto[];
  businessUnits: CreateBusinessUnitDto[];
  suppliers: CreateSupplierDto[];
  sourcingRecords: CreateSourcingRecordDto[];
  sourcingLocations: CreateSourcingLocationDto[];
}

const NON_META_PROPERTIES: Array<string> = [
  'material.path',
  'business_unit.path',
  't1_supplier.name',
  'producer.name',
];
const SOURCING_LOCATION_PROPERTIES: Array<string> = [
  'location_country_input',
  'location_address_input',
  'location_latitude_input',
  'location_longitude_input',
  'location_type',
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
  private layerId: string;

  async createDTOsFromSourcingRecordsSheets(
    importData: SourcingRecordsSheets,
    sourcingRecordGroupId: string,
  ): Promise<SourcingRecordsDtos> {
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

    const sourcingRecords: CreateSourcingRecordDto[] = await this.createSourcingRecordDtos(
      processedSourcingData.sourcingRecords,
    );
    const sourcingLocations: CreateSourcingLocationDto[] = await this.createSourcingLocationDtos(
      processedSourcingData.sourcingLocations,
      sourcingRecordGroupId,
    );

    return {
      materials,
      businessUnits,
      suppliers,
      adminRegions,
      sourcingLocations,
      sourcingRecords,
    };
  }
  private isSourcingLocationData(field: string): boolean {
    return !SOURCING_LOCATION_PROPERTIES.includes(field);
  }

  private isMeta(field: string): boolean {
    return !NON_META_PROPERTIES.includes(field);
  }

  private getYear(field: string): number | null {
    const regexMatch: RegExpMatchArray | null = field.match(/\d{4}_/gm);

    return regexMatch ? parseInt(regexMatch[0]) : null;
  }

  private cleanCustomData(customData: WorkSheet[]): any {
    const sourcingRecords: Record<string, any>[] = [];
    const sourcingLocations: Record<string, any>[] = [];
    /**
     * Clean all hashmaps that are empty therefore useless
     */
    const nonEmptyData = customData.filter(
      (row: WorkSheet) => row['material.path'] !== '',
    );
    /**
     * Separate base properties common for each sourcing-record row
     * Separate metadata properties to metadata object common for each sourcing-record row
     * Check if current key contains a year ('2018_tonnage') if so, get the year and its value
     */
    for (const eachRecordOfCustomData of nonEmptyData) {
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
        } else if (this.isMeta(field)) {
          metadata[field] = eachRecordOfCustomData[field];
        } else if (this.isSourcingLocationData(field)) {
          sourcingLocation[field] = eachRecordOfCustomData[field];
        } else {
          baseProps[field] = eachRecordOfCustomData[field];
        }
      }
      const sourcingLocationWithMeta = { ...sourcingLocation, metadata };
      sourcingLocations.push(sourcingLocationWithMeta);
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
    }
    return { sourcingLocations, sourcingRecords };
  }

  /**
   * @deprecated Temporary hack, to be removed soon
   *
   * @param additionalData
   * @private
   */
  private async createLayer(
    additionalData: Partial<Layer> = {},
  ): Promise<Layer> {
    const layer = Layer.merge(new Layer(), additionalData);

    return layer.save();
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
    /**
     * @TODO
     * @HARDCORE_COWBOY_STUFF_START
     * Remove this as soon as Layer data is provided
     * in the base dataset. Also remove the implementation
     */
    this.layerId = (await this.createLayer()).id;
    /**
     * @HARDCORE_COWBOY_STUFF_END
     */
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
   * Creates an array of CreateSourcingRecordDto objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @private
   */
  private async createSourcingRecordDtos(
    importData: Record<string, any>[],
  ): Promise<CreateSourcingRecordDto[]> {
    const sourcingRecordDtos: CreateSourcingRecordDto[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      sourcingRecordDtos.push(this.createSourcingRecordDTOFromData(importRow));
    });
    return sourcingRecordDtos;
  }

  /**
   * Creates an array of CreateSourcingLocationDto objects from the JSON data processed from the XLSX file
   *
   * @param importData
   * @private
   */
  private async createSourcingLocationDtos(
    importData: Record<string, any>[],
    sourcingRecordGroupId: string,
  ): Promise<CreateSourcingLocationDto[]> {
    const sourcingLocationDtos: CreateSourcingLocationDto[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      sourcingLocationDtos.push(
        this.createSourcingLocationDTOFromData(
          importRow,
          sourcingRecordGroupId,
        ),
      );
    });
    return sourcingLocationDtos;
  }

  private createMaterialDTOFromData(materialData: Record<string, any>): any {
    const materialDto = new CreateMaterialDto();
    materialDto.name = materialData.name;
    materialDto.description = materialData.description;
    materialDto.hsCodeId = materialData.hs_2017_code;
    materialDto.mpath = materialData.path_id;
    materialDto.layerId = this.layerId;
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
    return adminRegionDto;
  }

  private createSourcingLocationDTOFromData(
    sourcingLocationData: Record<string, any>,
    sourcingRecordGroupId: string,
  ): CreateSourcingLocationDto {
    const sourcingLocationDto = new CreateSourcingLocationDto();
    sourcingLocationDto.locationCountryInput =
      sourcingLocationData.location_country_input;
    sourcingLocationDto.locationAddressInput =
      sourcingLocationData.location_address_input;
    sourcingLocationDto.locationLatitude = isEmpty(
      sourcingLocationData.location_latitude_input,
    )
      ? undefined
      : parseFloat(sourcingLocationData.location_latitude_input);
    sourcingLocationDto.locationLongitude = isEmpty(
      sourcingLocationData.location_longitude_input,
    )
      ? undefined
      : parseFloat(sourcingLocationData.location_longitude_input);
    sourcingLocationDto.metadata = sourcingLocationData.metadata;
    sourcingLocationDto.sourcingRecordGroupId = sourcingRecordGroupId;
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
