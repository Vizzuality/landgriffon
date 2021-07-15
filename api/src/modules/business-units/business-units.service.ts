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
      attributes: ['name', 'description', 'status', 'metadata'],
      keyForAttribute: 'camelCase',
    };
  }

  async getBusinessUnitById(id: number): Promise<BusinessUnit> {
    const found = await this.businessUnitRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Business Unit with ID "${id}" not found`);
    }

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
    /**
     * @TODO:
     * - Validate that all entities are sane (something like validateOrReject from https://github.com/typeorm/typeorm/issues/913#issuecomment-533853309 without the hooks)
     * - Build associations between them, because this is a tree
     * - Save them in order, so the tree is sane
     * - In a future world, in a future PR, do this in a transaction (https://github.com/typeorm/typeorm/blob/master/docs/transactions.md)
     */

    return Promise.all(
      importData.map((importRow: CreateBusinessUnitDto) => {
        return this.create(importRow);
      }),
    );
  }
}
