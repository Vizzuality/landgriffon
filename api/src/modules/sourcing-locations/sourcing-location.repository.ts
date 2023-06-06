import { DataSource, SelectQueryBuilder } from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetLocationTypesDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { AppBaseRepository } from 'utils/app-base.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseQueryBuilder } from 'utils/base.query-builder';

@Injectable()
export class SourcingLocationRepository extends AppBaseRepository<SourcingLocation> {
  constructor(protected dataSource: DataSource) {
    super(SourcingLocation, dataSource.createEntityManager());
  }

  async getAvailableLocationTypes(
    locationTypesOptions: GetLocationTypesDto,
  ): Promise<{ locationType: string }[]> {
    const queryBuilder: SelectQueryBuilder<SourcingLocation> =
      this.createQueryBuilder('sl')
        .select('sl.locationType', 'locationType')
        .distinct()
        .orderBy('sl.locationType', locationTypesOptions.sort ?? 'DESC');

    const queryBuilderWithFilters: SelectQueryBuilder<SourcingLocation> =
      BaseQueryBuilder.addFilters(queryBuilder, locationTypesOptions);

    const locationTypes: { locationType: string }[] =
      await queryBuilderWithFilters.getRawMany();

    if (!locationTypes) {
      throw new NotFoundException(`No Location Types were found`);
    }

    return locationTypes;
  }
}
