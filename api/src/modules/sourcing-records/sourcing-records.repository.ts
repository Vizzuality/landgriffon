import { EntityRepository, Repository } from 'typeorm';
import { SourcingRecord } from './sourcing-record.entity';

@EntityRepository(SourcingRecord)
export class SourcingRecordsRepository extends Repository<SourcingRecord> {}
