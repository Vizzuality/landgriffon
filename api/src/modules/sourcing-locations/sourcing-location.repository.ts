import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@EntityRepository(SourcingLocation)
export class SourcingLocationRepository extends Repository<SourcingLocation> {
  async getSourcingLocationsMaterialsQuery(): Promise<
    SelectQueryBuilder<SourcingLocation>
  > {
    const materialsListQuery: any = this.createQueryBuilder('sl')
      .select([
        'sl.id',
        'mat.id',
        'mat.name',
        'sup.name',
        'producer.name',
        'sl.locationType',
        'sl.locationCountryInput',
        'bu.name',
        'sr',
      ])
      .innerJoin('sl.material', 'mat')
      .leftJoin('sl.t1Supplier', 'sup')
      .leftJoin('sl.producer', 'producer')
      .leftJoin('sl.businessUnit', 'bu')
      .leftJoin('sl.sourcingRecords', 'sr')
      .orderBy('mat.name')
      .addOrderBy('sl.id');

    return materialsListQuery;
  }
}
