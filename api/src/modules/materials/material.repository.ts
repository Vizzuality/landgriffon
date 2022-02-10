import { EntityRepository, SelectQueryBuilder } from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@EntityRepository(Material)
export class MaterialRepository extends ExtendedTreeRepository<
  Material,
  CreateMaterialDto
> {
  logger: Logger = new Logger(MaterialRepository.name);

  /**
   * @description Retrieves materials and it's ancestors (in a plain format) there are registered sourcingLocations for
   */

  async getSourcingDataMaterialsWithAncestry(): Promise<Material[]> {
    // Join and filters over materials present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const queryBuilder: SelectQueryBuilder<Material> = this.createQueryBuilder(
      'm',
    )
      .select('m.id')
      .innerJoin(SourcingLocation, 'sl', 'sl.materialId = m.id')
      .distinct(true);

    const [subQuery, subQueryParams]: [string, any[]] =
      queryBuilder.getQueryAndParameters();

    // Recursively find elements and their ancestry given Ids of the subquery above
    const result: Material[] = await this.query(
      `
        with recursive material_tree as (
            select m.id, m."parentId", m."name", m.description, m."createdAt", m."updatedAt", m."hsCodeId"
            from material m
            where id in
                        (${subQuery})
            union all
            select c.id, c."parentId", c."name", c.description, c."createdAt", c."updatedAt", c."hsCodeId"
            from material c
            join material_tree p on p."parentId" = c.id
        )
        select *
        from material_tree`,
      subQueryParams,
    ).catch((err: Error) =>
      this.logger.error(
        `Query Failed for retrieving materials with sourcing locations: `,
        err,
      ),
    );

    if (!result || !result.length)
      throw new NotFoundException(
        'No Materials with sourcing locations found. Please check if sourcing-data has been provided to the platform',
      );

    return result;
  }
}
