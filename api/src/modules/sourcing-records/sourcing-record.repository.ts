import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Injectable, Logger } from '@nestjs/common';

export type AnyImpactTableData =
  | ImpactTableData
  | ActualVsScenarioImpactTableData
  | ScenarioVsScenarioImpactTableData;

export class ImpactTableData {
  year: number;
  indicatorId: string;
  indicatorShortName: string;
  name: string;
  tonnes: string;
  impact: number;
  typeByIntervention: SOURCING_LOCATION_TYPE_BY_INTERVENTION | null;
}

export class ActualVsScenarioImpactTableData extends ImpactTableData {
  scenarioImpact: number;
}

export class ScenarioVsScenarioImpactTableData extends ImpactTableData {
  scenarioOneImpact: number;
  scenarioTwoImpact: number;
}

@Injectable()
export class SourcingRecordRepository extends Repository<SourcingRecord> {
  logger: Logger = new Logger(SourcingRecordRepository.name);

  constructor(private dataSource: DataSource) {
    super(SourcingRecord, dataSource.createEntityManager());
  }

  async getYears(materialIds?: string[]): Promise<number[]> {
    const queryBuilder: SelectQueryBuilder<SourcingRecord> =
      this.createQueryBuilder('sr')
        .select('year')
        .where('sr.tonnage > 0')
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
