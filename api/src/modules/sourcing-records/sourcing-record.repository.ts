import {
  Brackets,
  DataSource,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import {
  GetActualVsScenarioImpactTableDto,
  BaseImpactTableDto,
  GetImpactTableDto,
  GROUP_BY_VALUES,
} from 'modules/impact/dto/impact-table.dto';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';

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
