import { EntityRepository, TreeRepository } from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';

export interface FindTreesWithOptionsArgs {
  depth?: number;
}

@EntityRepository(Material)
export class MaterialRepository extends TreeRepository<Material> {
  async findTreesWithOptions(
    args?: FindTreesWithOptionsArgs,
  ): Promise<Material[]> {
    if (!args?.depth && args?.depth !== 0) {
      return super.findTrees();
    }

    const roots = await this.findRoots();
    roots.forEach((root: Material) => {
      this.depthHack[root.id] = args.depth as number;
    });
    await Promise.all(
      roots.map((root: Material) => this.findDescendantsTree(root)),
    );
    return roots;
  }

  /**
   * @TODO: If and when https://github.com/typeorm/typeorm/pull/7926 is merged, update typeorm and drop this
   */
  depthHack: Record<string, number> = {};
  protected buildChildrenEntityTree(
    entity: any,
    entities: any[],
    relationMaps: { id: any; parentId: any }[],
  ): void {
    const childProperty = this.metadata.treeChildrenRelation!.propertyName;
    const parentEntityId = this.metadata.primaryColumns[0].getEntityValue(
      entity,
    );
    const parentEntityDepth: number =
      parentEntityId in this.depthHack ? this.depthHack[parentEntityId] : -1;
    if (parentEntityDepth === 0) {
      entity[childProperty] = [];
      return;
    }

    const childRelationMaps = relationMaps.filter(
      (relationMap: { id: any; parentId: any }) =>
        relationMap.parentId === parentEntityId,
    );
    const childIds = new Set(
      childRelationMaps.map(
        (relationMap: { id: any; parentId: any }) => relationMap.id,
      ),
    );
    entity[childProperty] = entities.filter((entity: Material) =>
      childIds.has(this.metadata.primaryColumns[0].getEntityValue(entity)),
    );
    entity[childProperty].forEach((childEntity: any) => {
      const childEntityId = this.metadata.primaryColumns[0].getEntityValue(
        childEntity,
      );
      if (parentEntityDepth > 1) {
        this.depthHack[childEntityId] = parentEntityDepth - 1;
        this.buildChildrenEntityTree(childEntity, entities, relationMaps);
      }
    });
  }
}
