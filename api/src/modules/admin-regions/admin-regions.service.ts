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
import { FindTreesWithOptionsArgs } from 'utils/tree.repository';

@Injectable()
export class AdminRegionsService extends AppBaseService<
  AdminRegion,
  CreateAdminRegionDto,
  UpdateAdminRegionDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(AdminRegionRepository)
    protected readonly adminRegionRepository: AdminRegionRepository,
  ) {
    super(
      adminRegionRepository,
      adminRegionResource.name.singular,
      adminRegionResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<AdminRegion> {
    return {
      attributes: [
        'name',
        'description',
        'status',
        'geoRegionId',
        'geoRegion',
        'children',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getAdminRegionById(id: number): Promise<AdminRegion> {
    const found: AdminRegion | undefined =
      await this.adminRegionRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Admin region with ID "${id}" not found`);
    }

    return found;
  }

  async findTreesWithOptions(
    args?: FindTreesWithOptionsArgs,
  ): Promise<AdminRegion[]> {
    return this.adminRegionRepository.findTrees(args);
  }

  async createTree(importData: CreateAdminRegionDto[]): Promise<AdminRegion[]> {
    return this.adminRegionRepository.saveListToTree(importData, 'mpath');
  }

  // TODO: proper typing after validating this works
  async getAdminAndGeoRegionIdByCountryIsoAlpha2(
    countryIsoAlpha2Code: string,
  ): Promise<{ id: string; geoRegionId: string }> {
    const adminAndGeoRegionId: any = await this.adminRegionRepository
      .createQueryBuilder('ar')
      .select('id')
      .addSelect('"geoRegionId"')
      .where('ar.isoA2 = :countryIsoAlpha2Code', {
        countryIsoAlpha2Code: countryIsoAlpha2Code,
      })
      .getRawOne();
    if (!adminAndGeoRegionId)
      throw new Error(
        `An Admin Region with ${countryIsoAlpha2Code} ISO Alpha 2 code could not been found`,
      );
    return adminAndGeoRegionId;
  }

  async getAdminRegionByName(adminRegionName: string): Promise<AdminRegion> {
    const adminRegion: AdminRegion | undefined =
      await this.adminRegionRepository.findOne({
        where: { name: adminRegionName },
      });

    if (!adminRegion)
      throw new Error(
        `An Admin Region with name ${adminRegionName} could not been found`,
      );
    return adminRegion;
  }

  async getAdminRegionIdByCoordinates(coordinates: {
    lng: number;
    lat: number;
  }): Promise<{ adminRegionId: string; geoRegionId: string }> {
    return this.adminRegionRepository.getAdminRegionAndGeoRegionIdByCoordinates(
      coordinates,
    );
  }
}
