import {
  Brackets,
  EntityRepository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { LocationTypesOptionsDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { AppBaseRepository } from 'utils/app-base.repository';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(SourcingLocation)
export class SourcingLocationRepository extends AppBaseRepository<SourcingLocation> {
  async getAvailableLocationTypes(
    locationTypesOptions: LocationTypesOptionsDto,
  ): Promise<{ locationType: string }[]> {
    const queryBuilder: SelectQueryBuilder<SourcingLocation> =
      this.createQueryBuilder('sl')
        .select('sl.locationType', 'locationType')
        .distinct();
    if (locationTypesOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: locationTypesOptions.materialIds,
      });
    }
    if (locationTypesOptions.supplierIds) {
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl."t1SupplierId" IN (:...suppliers)', {
            suppliers: locationTypesOptions.supplierIds,
          }).orWhere('sl."producerId" IN (:...suppliers)', {
            suppliers: locationTypesOptions.supplierIds,
          });
        }),
      );
    }
    if (locationTypesOptions.businessUnitIds) {
      queryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds: locationTypesOptions.businessUnitIds,
      });
    }
    if (locationTypesOptions.originIds) {
      queryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds: locationTypesOptions.originIds,
      });
    }

    const locationTypesObjectsInDatabase: { locationType: string }[] =
      await queryBuilder.getRawMany();

    if (!locationTypesObjectsInDatabase) {
      throw new NotFoundException(
        `No Sourcing Locations with Location Types found`,
      );
    }

    return locationTypesObjectsInDatabase;
  }
}
