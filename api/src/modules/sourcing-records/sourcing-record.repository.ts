import { EntityRepository, Repository } from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

@EntityRepository(SourcingRecord)
export class SourcingRecordRepository extends Repository<SourcingRecord> {
  async getYears(): Promise<number[]> {
    const sourcingRecordsYears: any[] = await this.createQueryBuilder(
      'sourcingRecords',
    )
      .select('year')
      .distinct(true)
      .getRawMany();

    return sourcingRecordsYears
      .map((elem: { year: number }) => elem.year)
      .sort();
  }
}
