import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { Injectable, Logger } from '@nestjs/common';
import { GetMaterialTreeWithOptionsDto } from 'modules/materials/dto/get-material-tree-with-options.dto';
import { BaseQueryBuilder } from 'utils/base.query-builder';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class MaterialRepository extends ExtendedTreeRepository<
  Material,
  CreateMaterialDto
> {
  constructor(private dataSource: DataSource) {
    super(Material, dataSource.createEntityManager());
  }

  logger: Logger = new Logger(MaterialRepository.name);

  /**
   * @description Get all materials that are present in Sourcing Locations with given filters
   *              Additionally if withAncestry set to true (default) it will return the ancestry of each
   *              element up to the root
   */

  async getMaterialsFromSourcingLocations(
    materialTreeOptions: GetMaterialTreeWithOptionsDto,
    withAncestry: boolean = true,
  ): Promise<Material[]> {
    const initialQueryBuilder: SelectQueryBuilder<Material> =
      this.createQueryBuilder('m')
        .innerJoin(SourcingLocation, 'sl', 'sl.materialId = m.id')
        .distinct(true);

    const queryBuilder: SelectQueryBuilder<Material> =
      BaseQueryBuilder.addFilters<Material>(
        initialQueryBuilder,
        materialTreeOptions,
      );

    if (!withAncestry) {
      return queryBuilder.getMany();
    }

    queryBuilder.select('m.id');

    // Recursively find elements and their ancestry given Ids of the subquery above
    return this.getEntityAncestry<Material>(queryBuilder, Material.name);
  }
}
