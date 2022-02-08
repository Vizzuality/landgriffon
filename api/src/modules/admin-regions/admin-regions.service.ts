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
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';

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
    protected readonly sourcingLocationsService: SourcingLocationsService,
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

  async findAllUnpaginated(): Promise<AdminRegion[]> {
    return this.adminRegionRepository.find();
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

  async getAdminRegionIdByCoordinatesAndLevel(searchParams: {
    lng: number;
    lat: number;
    level: number;
  }): Promise<{ adminRegionId: string; geoRegionId: string }> {
    return this.adminRegionRepository.getAdminRegionAndGeoRegionIdByCoordinatesAndLevel(
      searchParams,
    );
  }

  async getClosestAdminRegionByCoordinates(coordinates: {
    lng: number;
    lat: number;
  }): Promise<any> {
    return this.adminRegionRepository.getClosestAdminRegionByCoordinates(
      coordinates,
    );
  }

  /**
   *
   * @description Get a tree of AdminRegions where there are sourcing-locations registered within
   */

  async getAdminRegionTreeWithSourcingLocations(): Promise<any> {
    const adminRegionIdsFromSourcingLocations: string[] =
      await this.sourcingLocationsService.getAdminRegionIdsAndParentIds();
    const allAdminRegions: AdminRegion[] = await this.findAllUnpaginated();
    const adminRegionLineage: AdminRegion[] = this.getAncestry<AdminRegion>(
      allAdminRegions,
      adminRegionIdsFromSourcingLocations,
    );
    return this.buildTree<AdminRegion>(adminRegionLineage, null);
  }

  async getTrees(treeOptions: {
    depth?: number;
    withSourcingLocations?: boolean;
  }): Promise<AdminRegion[]> {
    const { depth, withSourcingLocations } = treeOptions;
    if (withSourcingLocations)
      return this.getAdminRegionTreeWithSourcingLocations();
    return this.findTreesWithOptions({ depth });
  }

  async getAdminRegionByIds(ids: string[]): Promise<AdminRegion[]> {
    return this.adminRegionRepository.findByIds(ids);
  }
}
