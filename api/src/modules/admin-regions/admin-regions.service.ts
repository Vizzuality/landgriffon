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
    const found: AdminRegion | undefined =
      await this.adminRegionRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Admin region with ID "${id}" not found`);
    }

    return found;
  }

  async getAdminRegionsById(id: string[]): Promise<AdminRegion[]> {
    const found: AdminRegion[] = await this.adminRegionRepository.findByIds(id);
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

  async getAdminRegionIdByCoordinatesAndLevel(
    searchParams: {
      lng: number;
      lat: number;
      level: number;
    },
    country?: string,
  ): Promise<{ adminRegionId: string; geoRegionId: string }> {
    return this.adminRegionRepository.getAdminRegionAndGeoRegionIdByCoordinatesAndLevel(
      searchParams,
      country,
    );
  }

  async getClosestAdminRegionByCoordinates(
    coordinates: {
      lng: number;
      lat: number;
    },
    country?: string,
  ): Promise<any> {
    return this.adminRegionRepository.getClosestAdminRegionByCoordinates(
      coordinates,
      country,
    );
  }

  /**
   *
   * @description Get a tree of AdminRegions where there are sourcing-locations registered within
   */

  async getAdminRegionTreeWithSourcingLocations(
    adminRegionTreeOptions: GetAdminRegionTreeWithOptionsDto,
  ): Promise<AdminRegion[]> {
    const adminRegionLineage: AdminRegion[] =
      await this.adminRegionRepository.getSourcingDataAdminRegionsWithAncestry(
        adminRegionTreeOptions,
      );
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
      return this.getAdminRegionTreeWithSourcingLocations(
        adminRegionTreeOptions,
      );
    }

    return this.findTreesWithOptions({ depth: adminRegionTreeOptions.depth });
  }

  async getAdminRegionByIds(ids: string[]): Promise<AdminRegion[]> {
    return this.adminRegionRepository.findByIds(ids);
  }

  async getAdminRegionDescendants(adminRegionIds: string[]): Promise<string[]> {
    // using type casting not to search for and provide the full entity, since only id is used by the method (to improve performance)
    let adminRegions: AdminRegion[] = [];
    for (const id of adminRegionIds) {
      const result: AdminRegion[] =
        await this.adminRegionRepository.findDescendants({
          id,
        } as AdminRegion);
      adminRegions = [...adminRegions, ...result];
    }

    return adminRegions.map((adminRegion: AdminRegion) => adminRegion.id);
  }
}
