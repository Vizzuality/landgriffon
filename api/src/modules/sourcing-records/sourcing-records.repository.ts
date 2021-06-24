import { EntityRepository, Repository } from 'typeorm';
import { SourcingRecord } from './sourcing-records.entity';

@EntityRepository(SourcingRecord)
export class SourcingRecordsRepository extends Repository<SourcingRecord> {}
