import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Supplier, SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { Injectable, Logger } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetSupplierByType } from 'modules/suppliers/dto/get-supplier-by-type.dto';
import { BaseQueryBuilder } from 'utils/base.query-builder';

@Injectable()
export class SupplierRepository extends ExtendedTreeRepository<
  Supplier,
  CreateSupplierDto
> {
  logger: Logger = new Logger(SupplierRepository.name);

  constructor(private dataSource: DataSource) {
    super(Supplier, dataSource.createEntityManager());
  }

  /**
   * @description Get all suppliers that are present in Sourcing Locations with given filters
   *              Additionally if withAncestry set to true (default) it will return the ancestry of each
   *              element up to the root
   */

  async getSuppliersFromSourcingLocations(
    options: GetSupplierByType,
    withAncestry: boolean = true,
  ): Promise<Supplier[]> {
    const initialQueryBuilder: SelectQueryBuilder<Supplier> =
      this.createQueryBuilder('s').distinct(true);
    //initialQueryBuilder.orderBy('s.name', options.sort ?? 'ASC');

    const jointQueryBuilder: SelectQueryBuilder<Supplier> =
      this.joinSourcingLocationsByGivenSupplierTypeOption(
        initialQueryBuilder,
        options.type,
      );
    const queryBuilder: SelectQueryBuilder<Supplier> =
      BaseQueryBuilder.addFilters(jointQueryBuilder, options);

    if (!withAncestry) {
      return queryBuilder.getMany();
    }
    queryBuilder.select('s.id');

    return this.getEntityAncestryFlatArray<Supplier>(
      queryBuilder,
      Supplier.name,
    );
  }

  private joinSourcingLocationsByGivenSupplierTypeOption(
    queryBuilder: SelectQueryBuilder<Supplier>,
    type?: SUPPLIER_TYPES,
  ): SelectQueryBuilder<Supplier> {
    if (type === SUPPLIER_TYPES.T1SUPPLIER) {
      queryBuilder.innerJoin(SourcingLocation, 'sl', 'sl.t1SupplierId = s.id');
    }
    if (type === SUPPLIER_TYPES.PRODUCER) {
      queryBuilder.innerJoin(SourcingLocation, 'sl', 'sl.producerId = s.id');
    }
    if (!type) {
      queryBuilder.innerJoin(
        SourcingLocation,
        'sl',
        'sl.t1SupplierId = s.id OR sl.producerId = s.id',
      );
    }
    return queryBuilder;
  }
}
