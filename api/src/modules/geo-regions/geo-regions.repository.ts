import { EntityRepository, Repository } from 'typeorm';
import { GeoRegions } from './geo-regions.entity';

@EntityRepository(GeoRegions)
export class GeoRegionsRepository extends Repository<GeoRegions> {}
