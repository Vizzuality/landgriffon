import { EntityRepository, SelectQueryBuilder } from 'typeorm';
import { Supplier, SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetSupplierTreeWithOptions } from 'modules/suppliers/dto/get-supplier-by-type.dto';

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
    filterOptions?: GetSupplierTreeWithOptions,
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
      );
    if (!filterOptions?.type) {
      queryBuilder.where('sl.t1SupplierId IS NOT NULL');
      queryBuilder.orWhere('sl.producerId IS NOT NULL');
    }
    if (filterOptions?.type === SUPPLIER_TYPES.PRODUCER) {
      queryBuilder.orWhere('sl.producerId IS NOT NULL');
    }
    if (filterOptions?.type === SUPPLIER_TYPES.T1SUPPLIER) {
      queryBuilder.where('sl.t1SupplierId IS NOT NULL');
    }
    queryBuilder.distinct(true);

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
        select *
        from supplier_tree`,
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
