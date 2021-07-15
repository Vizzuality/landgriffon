import { Injectable } from '@nestjs/common';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { SourcingRecordsSheets } from 'modules/files/xlsx-parser.service';
// eslint-disable-next-line no-restricted-imports
import { createLayer } from '../../../test/entity-mocks';

export interface DTOTransformedData {
  materials: CreateMaterialDto[];
  adminRegions: CreateAdminRegionDto[];
  businessUnits: CreateBusinessUnitDto[];
  suppliers: CreateSupplierDto[];
  sourcingData: Record<string, any>[];
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

  async processDTOsFromData(
    importData: SourcingRecordsSheets,
  ): Promise<Partial<DTOTransformedData>> {
    const materials: CreateMaterialDto[] = await this.processMaterials(
      importData.materials,
    );
    const businessUnits: CreateBusinessUnitDto[] = await this.processBusinessUnits(
      importData.businessUnits,
    );
    const suppliers: CreateSupplierDto[] = await this.processSuppliers(
      importData.suppliers,
    );
    const adminRegions: CreateAdminRegionDto[] = await this.processAdminRegions(
      importData.countries,
    );

    return { materials, businessUnits, suppliers, adminRegions };
  }

  private async processMaterials(
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

  private async processBusinessUnits(
    importData: Record<string, any>[],
  ): Promise<CreateBusinessUnitDto[]> {
    const businessUnitsList: CreateBusinessUnitDto[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      businessUnitsList.push(this.createBusinessUnitDTOFromData(importRow));
    });
    return businessUnitsList;
  }

  private async processSuppliers(
    importData: Record<string, any>[],
  ): Promise<CreateSupplierDto[]> {
    const supplierList: CreateSupplierDto[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      supplierList.push(this.crateSuppliersDTOFromData(importRow));
    });
    return supplierList;
  }

  private async processAdminRegions(
    importData: Record<string, any>[],
  ): Promise<CreateAdminRegionDto[]> {
    const adminRegionList: CreateAdminRegionDto[] = [];
    importData.forEach((importRow: Record<string, any>) => {
      adminRegionList.push(this.createAdminRegionDTOFromData(importRow));
    });
    return adminRegionList;
  }

  private createMaterialDTOFromData(materialData: Record<string, any>): any {
    const materialDto = new CreateMaterialDto();
    materialDto.name = materialData.name;
    materialDto.description = materialData.description;
    materialDto.hsCodeId = materialData.hs_2017_code;
    materialDto.layerId = this.layerId;
    return materialDto;
  }
  private createBusinessUnitDTOFromData(
    businessUnitData: Record<string, any>,
  ): CreateBusinessUnitDto {
    const businessUnitDto = new CreateBusinessUnitDto();
    businessUnitDto.name = businessUnitData.name;
    businessUnitDto.description = businessUnitData.description;
    return businessUnitDto;
  }

  private crateSuppliersDTOFromData(
    supplierData: Record<string, any>,
  ): CreateSupplierDto {
    const suppliersDto = new CreateSupplierDto();
    suppliersDto.name = supplierData.name;
    suppliersDto.description = supplierData.description;
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
