import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Material, materialResource } from 'modules/materials/material.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { MaterialRepository } from 'modules/materials/material.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { UpdateMaterialDto } from 'modules/materials/dto/update.material.dto';
import { FindTreesWithOptionsArgs } from 'utils/tree.repository';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';

@Injectable()
export class MaterialsService extends AppBaseService<
  Material,
  CreateMaterialDto,
  UpdateMaterialDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(MaterialRepository)
    protected readonly materialRepository: MaterialRepository,
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
        const parentMaterial: Material = await this.getMaterialById(
          createModel.parentId,
        );
        createModel.parent = parentMaterial;
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
    const found: Material | undefined = await this.materialRepository.findOne(
      id,
    );

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

  async getMaterialsTreeWithSourcingLocations(
    materialTreeOptions: GetMaterialTreeWithOptionsDto,
  ): Promise<Material[]> {
    const materialLineage: Material[] =
      await this.materialRepository.getSourcingDataMaterialsWithAncestry(
        materialTreeOptions,
      );
    return this.buildTree<Material>(materialLineage, null);
  }

  async getTrees(
    materialTreeOptions: GetMaterialTreeWithOptionsDto,
  ): Promise<Material[]> {
    if (materialTreeOptions.withSourcingLocations)
      return this.getMaterialsTreeWithSourcingLocations(materialTreeOptions);
    return this.findTreesWithOptions({ depth: materialTreeOptions.depth });
  }

  async getMaterialsDescendants(materialIds: string[]): Promise<any> {
    let materials: Material[] = [];
    for (const id of materialIds) {
      const result: Material[] = await this.materialRepository.findDescendants({
        id,
      } as Material); // using type casting not to search for and provide the full entity, since only id is used by the method (to improve performance)
      materials = [...materials, ...result];
    }

    return materials.map((material: Material) => material.id);
  }
}
