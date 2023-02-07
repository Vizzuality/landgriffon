import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  Material,
  materialResource,
  MATERIALS_STATUS,
} from 'modules/materials/material.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { MaterialRepository } from 'modules/materials/material.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { UpdateMaterialDto } from 'modules/materials/dto/update.material.dto';
import { FindTreesWithOptionsArgs } from 'utils/tree.repository';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { In } from 'typeorm';
import { getDiffForEntitiesToBeActivated } from 'utils/helpers/array-diff.helper';

@Injectable()
export class MaterialsService extends AppBaseService<
  Material,
  CreateMaterialDto,
  UpdateMaterialDto,
  AppInfoDTO
> {
  constructor(
    protected readonly materialRepository: MaterialRepository,
    @Inject(forwardRef(() => AdminRegionsService))
    protected readonly adminRegionService: AdminRegionsService,
    @Inject(forwardRef(() => BusinessUnitsService))
    protected readonly businessUnitsService: BusinessUnitsService,
    @Inject(forwardRef(() => SuppliersService))
    protected readonly suppliersService: SuppliersService,
    @Inject(forwardRef(() => SourcingLocationsService))
    protected readonly sourcingLocationService: SourcingLocationsService,
  ) {
    super(
      materialRepository,
      materialResource.name.singular,
      materialResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Material> {
    return {
      attributes: [
        'name',
        'description',
        'status',
        'hsCodeId',
        'earthstatId',
        'mapspamId',
        'metadata',
        'parentId',
        'children',
        'createdAt',
        'updatedAt',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async createTree(importData: CreateMaterialDto[]): Promise<Material[]> {
    this.logger.log(`Creating Material tree with ${importData.length} nodes`);
    return this.materialRepository.saveListToTree(importData, 'mpath');
  }

  /**
   * Remove from tree all materials that don't have h3 data associated with them
   *
   * @param root
   */
  static filterMaterialTree(root: Material): Material[] {
    let result: Material[] = [];
    if (!root.materialToH3s || root.materialToH3s.length === 0) {
      if (root.children) {
        root.children.forEach((child: Material) => {
          result = result.concat(this.filterMaterialTree(child));
        });
      }
      return result;
    } else {
      if (root.children) {
        root.children.forEach((child: Material) => {
          const material: Material[] = this.filterMaterialTree(child);
          result = result.concat(material);
        });
        root.children = result;
      }
      root.parent = root.parent ? root.parent.parent : null;
      return [root];
    }
  }

  async findTreesWithOptions(
    args?: FindTreesWithOptionsArgs,
  ): Promise<Material[]> {
    const materialTree: Material[] = await this.materialRepository.findTrees({
      ...args,
      relations: ['materialToH3s'],
    });

    let filteredMaterialTree: Material[] = [];
    materialTree.forEach((child: Material) => {
      filteredMaterialTree = filteredMaterialTree.concat(
        MaterialsService.filterMaterialTree(child),
      );
    });

    return filteredMaterialTree;
  }

  async create(createModel: CreateMaterialDto): Promise<Material> {
    if (createModel.parentId) {
      try {
        createModel.parent = await this.getMaterialById(createModel.parentId);
      } catch (error) {
        throw new HttpException(
          `Parent material with ID "${createModel.parentId}" not found`,
          400,
        );
      }
    }

    return super.create(createModel);
  }

  async getMaterialById(id: string): Promise<Material> {
    const found: Material | null = await this.materialRepository.findOne({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException(`Material with ID "${id}" not found`);
    }

    return found;
  }

  async getMaterialsById(ids: string[]): Promise<Material[]> {
    return this.materialRepository.findByIds(ids);
  }

  async saveMany(entityArray: Material[]): Promise<void> {
    await this.materialRepository.save(entityArray);
  }

  async clearTable(): Promise<void> {
    await this.materialRepository.delete({});
  }

  async findAllUnpaginated(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  /**
   *
   * @description Get a tree of Materials with registered sourcing locations
   */

  async getMaterialsTreeFromSourcingLocations(
    materialTreeOptions: GetMaterialTreeWithOptionsDto,
  ): Promise<Material[]> {
    const materialLineage: Material[] =
      await this.materialRepository.getMaterialsFromSourcingLocations(
        materialTreeOptions,
      );
    return this.buildTree<Material>(materialLineage, null);
  }

  /**
   * @description: Returns a tree of Materials, either from the main Material table, or
   *               starting from those that are present in Sourcing Locations, building the tree up
   *               to the root.
   * @param materialTreeOptions
   */
  async getTrees(
    materialTreeOptions: GetMaterialTreeWithOptionsDto,
  ): Promise<Material[]> {
    if (materialTreeOptions.withSourcingLocations) {
      if (materialTreeOptions.originIds) {
        materialTreeOptions.originIds =
          await this.adminRegionService.getAdminRegionDescendants(
            materialTreeOptions.originIds,
          );
      }
      if (materialTreeOptions.businessUnitIds) {
        materialTreeOptions.businessUnitIds =
          await this.businessUnitsService.getBusinessUnitsDescendants(
            materialTreeOptions.businessUnitIds,
          );
      }
      if (materialTreeOptions.supplierIds) {
        materialTreeOptions.supplierIds =
          await this.suppliersService.getSuppliersDescendants(
            materialTreeOptions.supplierIds,
          );
      }
      return this.getMaterialsTreeFromSourcingLocations(materialTreeOptions);
    }

    return this.findTreesWithOptions({ depth: materialTreeOptions.depth });
  }

  async getMaterialsDescendants(materialIds: string[]): Promise<string[]> {
    // using type casting not to search for and provide the full entity, since only id is used by the method (to improve performance)
    let materials: Material[] = [];
    for (const id of materialIds) {
      const result: Material[] = await this.materialRepository.findDescendants({
        id,
      } as Material);
      materials = [...materials, ...result];
    }

    return materials.map((material: Material) => material.id);
  }

  async activateMaterials(
    materialsFromSheet: CreateMaterialDto[],
  ): Promise<Material[]> {
    const hsCodeToActivateMaterialsBy: string[] = materialsFromSheet
      .filter((i: CreateMaterialDto) => i.status === MATERIALS_STATUS.ACTIVE)
      .map((i: CreateMaterialDto) => i.hsCodeId);
    this.logger.log(`Found ${hsCodeToActivateMaterialsBy.length} to activate`);
    const materialsFoundByProvidedHsCodes: Material[] =
      await this.materialRepository.find({
        where: {
          hsCodeId: In(hsCodeToActivateMaterialsBy),
        },
      });
    if (!materialsFoundByProvidedHsCodes.length) {
      throw new ServiceUnavailableException(
        'No Materials found matching provided hs codes. Unable to calculate impact. Aborting Import',
      );
    }
    if (
      materialsFoundByProvidedHsCodes.length !==
      hsCodeToActivateMaterialsBy.length
    ) {
      const codesNotFoundInDb: string[] = getDiffForEntitiesToBeActivated(
        hsCodeToActivateMaterialsBy,
        materialsFoundByProvidedHsCodes.map((m: Material) => m.hsCodeId),
      );
      this.logger.warn(`Mismatch in materials meant to be activated: `);
      this.logger.warn(
        `Provided hsCodes with no matching Materials in DB: ${codesNotFoundInDb.join(
          ', ',
        )}`,
      );
      this.logger.warn(`Activating matching materials...`);
    }
    const activatedMaterials: Material[] = materialsFoundByProvidedHsCodes.map(
      (i: Material) =>
        ({
          ...i,
          status: MATERIALS_STATUS.ACTIVE,
        } as Material),
    );
    return this.materialRepository.save(activatedMaterials);
  }

  async deactivateAllMaterials(): Promise<void> {
    this.logger.log(`Setting all Indicators to Inactive...`);
    const allMaterials: Material[] = await this.materialRepository.find();
    await this.materialRepository.save(
      allMaterials.map((i: Material) => ({
        ...i,
        status: MATERIALS_STATUS.INACTIVE,
      })),
    );
  }

  async checkActiveMaterials(materialIds: string[]): Promise<void> {
    const inactiveSelectedMaterials: Material[] =
      await this.materialRepository.find({
        where: {
          id: In(materialIds),
          status: MATERIALS_STATUS.INACTIVE,
        },
      });

    if (inactiveSelectedMaterials.length) {
      const inactiveMaterialNames: string[] = inactiveSelectedMaterials.map(
        (material: Material) => material.name,
      );
      throw new BadRequestException(
        `Following Requested Materials are not activated: ${inactiveMaterialNames.join(
          ', ',
        )}`,
      );
    }
  }
}
