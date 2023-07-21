import { DataSource, SelectQueryBuilder } from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';
import { Injectable, Logger } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetBusinessUnitTreeWithOptionsDto } from 'modules/business-units/dto/get-business-unit-tree-with-options.dto';
import { BaseQueryBuilder } from 'utils/base.query-builder';

@Injectable()
export class BusinessUnitRepository extends ExtendedTreeRepository<
  BusinessUnit,
  CreateBusinessUnitDto
> {
  logger: Logger = new Logger(BusinessUnitRepository.name);

  constructor(private dataSource: DataSource) {
    super(BusinessUnit, dataSource.createEntityManager());
  }

  /**
   * @description Get all business units that are present in Sourcing Locations with given filters
   *              Additionally if withAncestry set to true (default) it will return the ancestry of each
   *              element up to the root
   */
  async getBusinessUnitsFromSourcingLocations(
    businessUnitTreeOptions: GetBusinessUnitTreeWithOptionsDto,
    withAncestry: boolean = true,
  ): Promise<BusinessUnit[]> {
    // Join and filters over business-units present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const initialQueryBuilder: SelectQueryBuilder<BusinessUnit> =
      this.createQueryBuilder('bu')
        .innerJoin(SourcingLocation, 'sl', 'sl.businessUnitId = bu.id')
        .distinct(true);

    const queryBuilder: SelectQueryBuilder<BusinessUnit> =
      BaseQueryBuilder.addFilters<BusinessUnit>(
        initialQueryBuilder,
        businessUnitTreeOptions,
      );

    if (!withAncestry) {
      return queryBuilder.getMany();
    }
    queryBuilder.select('bu.id');

    // Recursively find elements and their ancestry given Ids of the subquery above
    return this.getEntityAncestryFlatArray<BusinessUnit>(
      queryBuilder,
      BusinessUnit.name,
    );
  }
}
