import { EntityRepository, Repository } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';

@EntityRepository(IndicatorRecord)
export class IndicatorRecordRepository extends Repository<IndicatorRecord> {}
