import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@EntityRepository(SourcingRecord)
export class SourcingRecordRepository extends Repository<SourcingRecord> {
  async getYears(materialIds?: string[]): Promise<number[]> {
    const queryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createQueryBuilder('sr')
        .select('year')
        .distinct(true)
        .orderBy('year', 'ASC');

    if (materialIds) {
      queryBuilder.leftJoin(
        SourcingLocation,
        'sl',
        'sl.id = sr."sourcingLocationId"',
      );
      queryBuilder.andWhere('"sl"."materialId" IN (:...materialIds)', {
        materialIds,
      });
    }
    const sourcingRecordsYears: SourcingRecord[] =
      await queryBuilder.getRawMany();

    return sourcingRecordsYears.map((elem: { year: number }) => elem.year);
  }
}
