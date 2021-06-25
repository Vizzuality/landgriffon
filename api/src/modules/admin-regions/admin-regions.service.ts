import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  AdminRegion,
  adminRegionResource,
} from 'modules/admin-regions/admin-region.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { UpdateAdminRegionDto } from 'modules/admin-regions/dto/update.admin-region.dto';

@Injectable()
export class AdminRegionsService extends AppBaseService<
  AdminRegion,
  CreateAdminRegionDto,
  UpdateAdminRegionDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(AdminRegionRepository)
    protected readonly repository: AdminRegionRepository,
  ) {
    super(
      repository,
      adminRegionResource.name.singular,
      adminRegionResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<AdminRegion> {
    return {
      attributes: ['name', 'description', 'status'],
      keyForAttribute: 'camelCase',
    };
  }

  async getAdminRegionById(id: number): Promise<AdminRegion> {
    const found = await this.repository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Admin region with ID "${id}" not found`);
    }

    return found;
  }
}
