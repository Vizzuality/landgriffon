import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
  PaginationMeta,
} from 'utils/app-base.service';
import { Material, materialResource } from 'modules/materials/material.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { MaterialRepository } from 'modules/materials/material.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { UpdateMaterialDto } from 'modules/materials/dto/update.material.dto';
import { FindTreesWithOptionsArgs } from 'utils/tree.repository';

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
    if (root.producerId === null && root.harvestId === null) {
      if (root.children) {
        root.children.forEach((child: Material) => {
          result = result.concat(this.filterMaterialTree(child));
        });
      }
      return result;
    } else {
      if (root.children) {
        root.children.forEach((child: Material) => {
          const foo: Material[] = this.filterMaterialTree(child);
          result = result.concat(foo);
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
    const materialTree: Material[] = await this.materialRepository.findTreesWithOptions(
      args,
    );

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
    const found = await this.materialRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Material with ID "${id}" not found`);
    }

    return found;
  }

  async saveMany(entityArray: Material[]): Promise<void> {
    await this.materialRepository.save(entityArray);
  }

  async clearTable(): Promise<void> {
    await this.materialRepository.delete({});
  }
}
