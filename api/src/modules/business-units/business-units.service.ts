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
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-units.dto';
import { UpdateBusinessUnitDto } from 'modules/business-units/dto/update.business-units.dto';

@Injectable()
export class BusinessUnitsService extends AppBaseService<
  BusinessUnit,
  CreateBusinessUnitDto,
  UpdateBusinessUnitDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(BusinessUnitRepository)
    protected readonly repository: BusinessUnitRepository,
  ) {
    super(
      repository,
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
    const found = await this.repository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Business Unit with ID "${id}" not found`);
    }

    return found;
  }
}
