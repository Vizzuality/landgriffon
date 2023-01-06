import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { GetAdminRegionTreeWithOptionsDto } from 'modules/admin-regions/dto/get-admin-region-tree-with-options.dto';
import { MaterialsService } from 'modules/materials/materials.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SelectQueryBuilder } from 'typeorm';

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

  async getAdminRegionById(id: string): Promise<AdminRegion> {
    const found: AdminRegion | null = await this.adminRegionRepository.findOne({
      where: { id },
    });

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
   * @description: Returns a flat array of all children of given Admin Region's Id
   *               Optionally return full entities, or Ids
   */

  // TODO: Add proper return typing to support retrieving entities or Ids
  async getAdminRegionDescendants(
    adminRegionIds: string[],
    options?: { fullEntities: boolean },
  ): Promise<any> {
    // using type casting not to search for and provide the full entity, since only id is used by the method (to improve performance)
    let adminRegions: AdminRegion[] = [];
    for (const id of adminRegionIds) {
      const result: AdminRegion[] =
        await this.adminRegionRepository.findDescendants({
          id,
        } as AdminRegion);
      adminRegions = [...adminRegions, ...result];
    }
    if (options?.fullEntities) {
      return adminRegions;
    }

    return adminRegions.map((adminRegion: AdminRegion) => adminRegion.id);
  }
}
