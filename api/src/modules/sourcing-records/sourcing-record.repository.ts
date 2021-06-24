import { EntityRepository, Repository } from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

@EntityRepository(SourcingRecord)
export class SourcingRecordRepository extends Repository<SourcingRecord> {}
