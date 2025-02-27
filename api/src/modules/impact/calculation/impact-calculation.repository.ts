import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ImpactQueryBuilderV2,
  ImpactQueryDependency,
} from 'modules/impact/calculation/impact-calculation.query.builder';
import { IIndicatorCalculationStrategy } from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { SourcingRecordsWithIndicatorRawData } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { ImpactCalculatorV2 } from './impact.calculator';
import { IndicatorRecord } from '../../indicator-records/indicator-record.entity';

// TODO: Following the plan to offload the impact calculation to a DB table and batch processing instead of
//       of running all at once and in memory, this repo will potentially be attached to this new entity
//       but for now, it will be used to encapsulate queries for raw impact calculations.
@Injectable()
export class ImpactCalculationRepository {
  logger: Logger = new Logger(ImpactCalculationRepository.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly impactQueryBuilder: ImpactQueryBuilderV2,
  ) {}

  async calculateRawImpact(
    queryDependencies: ImpactQueryDependency[],
  ): Promise<SourcingRecordsWithIndicatorRawData[]> {
    const query = this.impactQueryBuilder.buildQuery(queryDependencies);
    try {
      const result: SourcingRecordsWithIndicatorRawData[] =
        await this.entityManager.query(query);
      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async saveImpactRecords(indicatorRecords: IndicatorRecord[]): Promise<void> {
    await this.entityManager
      .getRepository(IndicatorRecord)
      .insert(indicatorRecords);
  }
}
