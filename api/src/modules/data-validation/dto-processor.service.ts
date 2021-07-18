import { Injectable } from '@nestjs/common';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { SourcingRecordsSheets } from 'modules/files/xlsx-parser.service';
// eslint-disable-next-line no-restricted-imports
import { createLayer } from '../../../test/entity-mocks';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';

export interface DTOTransformedData {
  materials: CreateMaterialDto[];
  adminRegions: CreateAdminRegionDto[];
  businessUnits: CreateBusinessUnitDto[];
  suppliers: CreateSupplierDto[];
  sourcingRecords: CreateSourcingRecordDto[];
  sourcingLocations: CreateSourcingLocationDto[];
}

/**
 *
 * @note:
 * In order to class-validator validate the DTOs, a new DTO / Entity instance (where
 * class-validator decorators are set) needs to be created
 * Otherwise class-validator's validation service has no awareness of said validations
 */

@Injectable()
export class DtoProcessorService {
  layerId: string;

  async createDTOsFromSourcingRecordsSheets(
    importData: SourcingRecordsSheets,
  ): Promise<DTOTransformedData> {
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
    const sourcingRecords: CreateSourcingRecordDto[] = await this.createSourcingRecordDtos(
      importData.sourcingData,
    );
    const sourcingLocations: CreateSourcingLocationDto[] = await this.createSourcingLocationDtos(
      importData.sourcingData,
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
     * in the base dataset
     */
    this.layerId = (await createLayer()).id;
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
    /**
     * @TODO: actually create the DTOs
     */
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
  ): Promise<CreateSourcingLocationDto[]> {
    const sourcingLocationDtos: CreateSourcingLocationDto[] = [];
    /**
     * @TODO: actually create the DTOs
     */
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
}
