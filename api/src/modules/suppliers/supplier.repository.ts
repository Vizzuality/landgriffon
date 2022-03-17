import { EntityRepository, SelectQueryBuilder } from 'typeorm';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetSupplierTreeWithOptions } from 'modules/suppliers/dto/get-supplier-tree-with-options.dto';

@EntityRepository(Supplier)
export class SupplierRepository extends ExtendedTreeRepository<
  Supplier,
  CreateSupplierDto
> {
  logger: Logger = new Logger(SupplierRepository.name);

  /**
   * @description Retrieves suppliers and it's ancestors (in a plain format) there are registered sourcingLocations for
   */

  async getSourcingDataSuppliersWithAncestry(
    supplierTreeOptions: GetSupplierTreeWithOptions,
  ): Promise<Supplier[]> {
    // Join and filters over materials present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const queryBuilder: SelectQueryBuilder<Supplier> = this.createQueryBuilder(
      's',
    )
      .select('s.id')
      .innerJoin(
        SourcingLocation,
        'sl',
        '(s.id = sl.t1SupplierId OR s.id = sl.producerId)',
      )
      .distinct(true);
    if (supplierTreeOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: supplierTreeOptions.materialIds,
      });
    }
    if (supplierTreeOptions.businessUnitIds) {
      queryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds: supplierTreeOptions.businessUnitIds,
      });
    }
    if (supplierTreeOptions.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: supplierTreeOptions.originIds,
      });
    }

    const [subQuery, subQueryParams]: [string, any[]] =
      queryBuilder.getQueryAndParameters();

    // Recursively find elements and their ancestry given Ids of the subquery above
    const result: Supplier[] = await this.query(
      `
        with recursive supplier_tree as (
            select m.id, m."parentId", m."name", m."description"
            from supplier m
            where id in
                        (${subQuery})
            union all
            select c.id, c."parentId", c."name", c."description"
            from supplier c
            join supplier_tree p on p."parentId" = c.id
        )
        select distinct *
        from supplier_tree
        order by name`,
      subQueryParams,
    ).catch((err: Error) =>
      this.logger.error(
        `Query Failed for retrieving supplier with sourcing locations: `,
        err,
      ),
    );

    if (!result || !result.length)
      throw new NotFoundException(
        'No Admin Regions with sourcing locations within found. Please check if sourcing-data has been provided to the platform',
      );

    return result;
  }
}
