import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class BusinessUnitsService extends AppBaseService<
  BusinessUnit,
  CreateBusinessUnitDto,
  UpdateBusinessUnitDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(BusinessUnitRepository)
    protected readonly businessUnitRepository: BusinessUnitRepository,
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

  async getBusinessUnitById(id: string): Promise<BusinessUnit> {
    const found: BusinessUnit | undefined =
      await this.businessUnitRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Business Unit with ID "${id}" not found`);
    }

    return found;
  }

  async getBusinessUnitsById(ids: string[]): Promise<BusinessUnit[]> {
    const found: BusinessUnit[] = await this.businessUnitRepository.findByIds(
      ids,
    );
    return found;
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

  async clearTable(): Promise<void> {
    await this.businessUnitRepository.delete({});
  }

  // TODO: Implement Tree response similar to other entities as Admin-Regions
  async getTrees(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
  ): Promise<BusinessUnit[]> {
    //const { depth, withSourcingLocations } = treeOptions;
    return this.getBusinessUnitTreeWithSourcingLocations(
      businessUnitTreeOptions,
    );
  }

  async getBusinessUnitTreeWithSourcingLocations(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
  ): Promise<BusinessUnit[]> {
    const businessUnitsLineage: BusinessUnit[] =
      await this.businessUnitRepository.getSourcingDataBusinessUnitssWithAncestry(
        businessUnitTreeOptions,
      );
    return this.buildTree<BusinessUnit>(businessUnitsLineage, null);
  }
}
