import { DataSource, Repository } from 'typeorm';
import { CachedData } from 'modules/cached-data/cached-data.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CachedDataRepository extends Repository<CachedData> {
  constructor(private dataSource: DataSource) {
    super(CachedData, dataSource.createEntityManager());
  }
}
