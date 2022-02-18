import { EntityRepository, SelectQueryBuilder } from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetBusinessUnitTreeWithOptionsDto } from './dto/get-business-unit-tree-with-options.dto';

@EntityRepository(BusinessUnit)
export class BusinessUnitRepository extends ExtendedTreeRepository<
  BusinessUnit,
  CreateBusinessUnitDto
> {
  logger: Logger = new Logger(BusinessUnitRepository.name);

  /**
   * @description Retrieves business-units and it's ancestors (in a plain format) there are registered sourcingLocations for
   */

  async getSourcingDataBusinessUnitssWithAncestry(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
  ): Promise<BusinessUnit[]> {
    // Join and filters over business-units present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const queryBuilder: SelectQueryBuilder<BusinessUnit> =
      this.createQueryBuilder('bu')
        .select('bu.id')
        .innerJoin(SourcingLocation, 'sl', 'sl.businessUnitId = bu.id')
        .distinct(true);

    if (businessUnitTreeOptions.supplierIds) {
      queryBuilder.andWhere('sl.t1SupplierId IN (:...materialIds)', {
        materialIds: businessUnitTreeOptions.supplierIds,
      });
      queryBuilder.orWhere('sl.producerId IN (:...materialIds)', {
        materialIds: businessUnitTreeOptions.supplierIds,
      });
    }
    if (businessUnitTreeOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...businessUnitIds)', {
        materialIds: businessUnitTreeOptions.materialIds,
      });
    }
    if (businessUnitTreeOptions.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: businessUnitTreeOptions.originIds,
      });
    }

    const [subQuery, subQueryParams]: [string, any[]] =
      queryBuilder.getQueryAndParameters();

    // Recursively find elements and their ancestry given Ids of the subquery above
    const result: BusinessUnit[] = await this.query(
      `
        with recursive businessunit_tree as (
            select m.id, m."parentId", m."name", m."description"
            from business_unit m
            where id in
                        (${subQuery})
            union all
            select c.id, c."parentId", c."name", c."description"
            from business_unit c
            join businessunit_tree p on p."parentId" = c.id
        )
        select distinct *
        from businessunit_tree
        order by name`,
      subQueryParams,
    ).catch((err: Error) =>
      this.logger.error(
        `Query Failed for retrieving business-units with sourcing locations: `,
        err,
      ),
    );

    if (!result || !result.length)
      throw new NotFoundException(
        'No Business-Units with sourcing locations found. Please check if sourcing-data has been provided to the platform',
      );

    return result;
  }
}
