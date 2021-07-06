import { EntityRepository, Repository } from 'typeorm';
import { SourcingRecordGroup } from 'modules/sourcing-record-groups/sourcing-record-group.entity';

@EntityRepository(SourcingRecordGroup)
export class SourcingRecordGroupRepository extends Repository<SourcingRecordGroup> {}
