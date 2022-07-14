import { EntityRepository, Repository } from 'typeorm';
import { CachedData } from 'modules/cached-data/cached.data.entity';

@EntityRepository(CachedData)
export class CachedDataRepository extends Repository<CachedData> {}
