import { DataSource, Repository } from 'typeorm';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SourcingLocationGroupRepository extends Repository<SourcingLocationGroup> {
  constructor(private dataSource: DataSource) {
    super(SourcingLocationGroup, dataSource.createEntityManager());
  }
}
