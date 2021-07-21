import { EntityRepository, Repository } from 'typeorm';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';

@EntityRepository(SourcingLocationGroup)
export class SourcingLocationGroupRepository extends Repository<SourcingLocationGroup> {}
