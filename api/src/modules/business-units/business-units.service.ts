import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  BusinessUnit,
  businessUnitResource,
} from 'modules/business-units/business-unit.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { UpdateBusinessUnitDto } from 'modules/business-units/dto/update.business-unit.dto';
import { GetBusinessUnitTreeWithOptionsDto } from 'modules/business-units/dto/get-business-unit-tree-with-options.dto';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { In } from 'typeorm';

@Injectable()
export class BusinessUnitsService extends AppBaseService<
  BusinessUnit,
  CreateBusinessUnitDto,
  UpdateBusinessUnitDto,
  AppInfoDTO
> {
  constructor(
    protected readonly businessUnitRepository: BusinessUnitRepository,
    @Inject(forwardRef(() => AdminRegionsService))
    protected readonly adminRegionService: AdminRegionsService,
    @Inject(forwardRef(() => MaterialsService))
    protected readonly materialsService: MaterialsService,
    @Inject(forwardRef(() => SuppliersService))
    protected readonly suppliersService: SuppliersService,
  ) {
    super(
      businessUnitRepository,
      businessUnitResource.name.singular,
      businessUnitResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<BusinessUnit> {
    return {
      attributes: ['name', 'description', 'status', 'metadata', 'children'],
      keyForAttribute: 'camelCase',
    };
  }

  async getBusinessUnitsById(ids: string[]): Promise<BusinessUnit[]> {
    return this.businessUnitRepository.findBy({ id: In(ids) });
  }

  async save(
    entities: BusinessUnit & BusinessUnit[],
  ): Promise<BusinessUnit | BusinessUnit[]> {
    return this.businessUnitRepository.save(entities);
  }

  async createTree(
    importData: CreateBusinessUnitDto[],
  ): Promise<BusinessUnit[]> {
    this.logger.log(`Creating Business tree with ${importData.length} nodes`);
    return this.businessUnitRepository.saveListToTree(importData, 'mpath');
  }

  async getTrees(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
  ): Promise<BusinessUnit[]> {
    if (businessUnitTreeOptions.materialIds) {
      businessUnitTreeOptions.materialIds =
        await this.materialsService.getMaterialsDescendants(
          businessUnitTreeOptions.materialIds,
        );
    }
    if (businessUnitTreeOptions.originIds) {
      businessUnitTreeOptions.originIds =
        await this.adminRegionService.getAdminRegionDescendants(
          businessUnitTreeOptions.originIds,
        );
    }
    return this.getBusinessUnitWithSourcingLocations(businessUnitTreeOptions);
  }

  async getBusinessUnitWithSourcingLocations(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
    withAncestry: boolean = true,
  ): Promise<BusinessUnit[]> {
    const businessUnitsLineage: BusinessUnit[] =
      await this.businessUnitRepository.getBusinessUnitsFromSourcingLocations(
        businessUnitTreeOptions,
        withAncestry,
      );
    if (!withAncestry) {
      return businessUnitsLineage;
    }
    return this.buildTree<BusinessUnit>(businessUnitsLineage, null);
  }

  async getBusinessUnitsDescendants(
    businessUnitIds: string[],
  ): Promise<string[]> {
    // using type casting not to search for and provide the full entity, since only id is used by the method (to improve performance)
    let businessUnits: BusinessUnit[] = [];
    for (const id of businessUnitIds) {
      const result: BusinessUnit[] =
        await this.businessUnitRepository.findDescendants({
          id,
        } as BusinessUnit);
      businessUnits = [...businessUnits, ...result];
    }

    return businessUnits.map((businessUnit: BusinessUnit) => businessUnit.id);
  }
}
