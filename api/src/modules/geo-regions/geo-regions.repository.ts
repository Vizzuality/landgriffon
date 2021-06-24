import { EntityRepository, Repository } from 'typeorm';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';

@EntityRepository(GeoRegion)
export class GeoRegionsRepository extends Repository<GeoRegion> {}
