import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { GetAdminRegionTreeWithOptionsDto } from 'modules/admin-regions/dto/get-admin-region-tree-with-options.dto';
import { MaterialsService } from 'modules/materials/materials.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { In, SelectQueryBuilder } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

@Injectable()
export class AdminRegionsService extends AppBaseService<
  AdminRegion,
  CreateAdminRegionDto,
  UpdateAdminRegionDto,
  AppInfoDTO
> {
  constructor(
    protected readonly adminRegionRepository: AdminRegionRepository,
    @Inject(forwardRef(() => MaterialsService))
    protected readonly materialService: MaterialsService,
    @Inject(forwardRef(() => SuppliersService))
    protected readonly supplierService: SuppliersService,
    @Inject(forwardRef(() => BusinessUnitsService))
    protected readonly businessUnitService: BusinessUnitsService,
    @Inject(forwardRef(() => SourcingLocationsService))
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

  /**
   * @description: Retrieves a Admin Region given its Id with optional parameters
   * @param id
   * @param {Object} [options] - Additional search options
   * @param {boolean} [options.isCountry] - Flag to find a country level admin-region given an ID. Defaults to false
   *
   */
  async getAdminRegionById(
    id: string,
    options?: { isCountry: boolean },
  ): Promise<AdminRegion> {
    const findOptions: FindOneOptions<AdminRegion> = { where: { id } };
    if (options?.isCountry) {
      // document
      findOptions.where = { ...findOptions.where, level: 0 };
    }
    const found: AdminRegion | null = await this.adminRegionRepository.findOne(
      findOptions,
    );

    if (!found) {
      throw new NotFoundException(`Admin region with ID "${id}" not found`);
    }

    return found;
  }

  async getAdminRegionsById(id: string[]): Promise<AdminRegion[]> {
    return await this.adminRegionRepository.findByIds(id);
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

  /**
   * @description: Get a AdminRegion Id and its GeoRegion Id by Admin Region name
   *               Optionally provide a Admin Region level to filter by it
   *               i.e: Level 0 is Country level, level 1 Region, level 2 Sub-Region...
   */

  async getAdminRegionAndGeoRegionIdsByAdminRegionName(
    adminRegionName: string,
    options?: { level: number },
  ): Promise<{ adminRegionId: string; geoRegionId: string }> {
    const queryBuilder: SelectQueryBuilder<AdminRegion> =
      this.adminRegionRepository
        .createQueryBuilder('adminRegion')
        .select('adminRegion.id', 'adminRegionId')
        .addSelect('geoRegion.id', 'geoRegionId')
        .innerJoin(
          GeoRegion,
          'geoRegion',
          'adminRegion.geoRegionId = geoRegion.id',
        )
        .where('adminRegion.name = :adminRegionName', { adminRegionName });
    if (options && !isNaN(options.level)) {
      queryBuilder.andWhere('adminRegion.level = :level', {
        level: options.level,
      });
    }
    const adminRegionAndGeoRegionIds: any = await queryBuilder.getRawOne();

    if (!adminRegionAndGeoRegionIds)
      throw new NotFoundException(
        `An Admin Region with name ${adminRegionName} ${
          options?.level ? `and level ${options.level} ` : ''
        }could not been found`,
      );
    return adminRegionAndGeoRegionIds;
  }

  async getAdminRegionIdByCoordinatesAndLevel(
    searchParams: {
      lng: number;
      lat: number;
      level: number;
    },
    sourcingLocation: SourcingLocation,
  ): Promise<{ adminRegionId: string; geoRegionId: string }> {
    return this.adminRegionRepository.getAdminRegionAndGeoRegionIdByCoordinatesAndLevel(
      searchParams,
      sourcingLocation,
    );
  }

  async getClosestAdminRegionByCoordinates(
    coordinates: {
      lng: number;
      lat: number;
    },
    sourcingLocation: SourcingLocation,
  ): Promise<any> {
    return this.adminRegionRepository.getClosestAdminRegionByCoordinates(
      coordinates,
      sourcingLocation,
    );
  }

  /**
   *
   * @description Get a tree of AdminRegions where there are sourcing-locations registered within
   */

  async getAdminRegionWithSourcingLocations(
    adminRegionTreeOptions: GetAdminRegionTreeWithOptionsDto,
    withAncestry: boolean = true,
  ): Promise<AdminRegion[]> {
    const adminRegionLineage: AdminRegion[] =
      await this.adminRegionRepository.getAdminRegionsFromSourcingLocations(
        adminRegionTreeOptions,
        withAncestry,
      );
    if (!withAncestry) {
      return adminRegionLineage;
    }
    return this.buildTree<AdminRegion>(adminRegionLineage, null);
  }

  async getTrees(
    adminRegionTreeOptions: GetAdminRegionTreeWithOptionsDto,
  ): Promise<AdminRegion[]> {
    if (adminRegionTreeOptions.withSourcingLocations) {
      if (adminRegionTreeOptions.businessUnitIds) {
        adminRegionTreeOptions.businessUnitIds =
          await this.businessUnitService.getBusinessUnitsDescendants(
            adminRegionTreeOptions.businessUnitIds,
          );
      }
      if (adminRegionTreeOptions.supplierIds) {
        adminRegionTreeOptions.supplierIds =
          await this.supplierService.getSuppliersDescendants(
            adminRegionTreeOptions.supplierIds,
          );
      }
      if (adminRegionTreeOptions.materialIds) {
        adminRegionTreeOptions.materialIds =
          await this.materialService.getMaterialsDescendants(
            adminRegionTreeOptions.materialIds,
          );
      }
      return this.getAdminRegionWithSourcingLocations(adminRegionTreeOptions);
    }

    return this.findTreesWithOptions({ depth: adminRegionTreeOptions.depth });
  }

  async getAdminRegionByIds(ids: string[]): Promise<AdminRegion[]> {
    return this.adminRegionRepository.findByIds(ids);
  }

  /**
   * @description: Returns an array of all children of given Admin Region's Ids with optional parameters
   * @param {string[]} adminRegionIds - The IDs of the admin regions.
   * @param {Object} [options] - Optional find options.
   * @param {boolean} [options.fullEntities] - A flag indicating whether to return the full entities or just the IDs. S
   * the [options.treeResponse] flag
   * @param {boolean} [options.treeResponse] - A flag indicating whether to return the response in tree format. This options overrides fullEntities option
   * @returns {Promise<any>} The promise that resolves to the descendants of the admin regions.
   **/
  // TODO: Add proper return typing to support retrieving entities or Ids
  async getAdminRegionDescendants(
    adminRegionIds: string[],
    options?: { fullEntities?: boolean; treeResponse?: boolean },
  ): Promise<any> {
    // using type casting not to search for and r
    //provide the full entity, since only id is used by the method (to improve performance)
    let adminRegions: AdminRegion[] = [];

    for (const id of adminRegionIds) {
      if (options?.treeResponse) {
        const result: AdminRegion =
          await this.adminRegionRepository.findDescendantsTree({
            id,
          } as AdminRegion);
        adminRegions.push(result);
      } else {
        const result: AdminRegion[] =
          await this.adminRegionRepository.findDescendants({
            id,
          } as AdminRegion);

        adminRegions = [...adminRegions, ...result];
      }
    }
    if (options?.fullEntities || options?.treeResponse) {
      return adminRegions;
    }

    return adminRegions.map((adminRegion: AdminRegion) => adminRegion.id);
  }
  /**
   * @description: Retrieving max admin region depth level of selected materials
   * based on mpath column which represents the ascendants path to the material
   * @param adminRegionIds
   */
  async getAdminRegionsMaxLevel(adminRegionIds: string[]): Promise<number> {
    const adminRegions: AdminRegion[] | undefined =
      await this.adminRegionRepository.find({
        where: { id: In(adminRegionIds) },
      });

    if (adminRegions) {
      const adminRegionLevels: number[] = Object.values(
        adminRegions.map((adminRegion: AdminRegion) => adminRegion.level),
      );
      return Math.max(...adminRegionLevels);
    } else {
      return 0;
    }
  }
}
