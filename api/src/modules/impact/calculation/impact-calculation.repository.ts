import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ImpactQueryBuilderV2 } from 'modules/impact/calculation/impact-calculation.query.builder';
import { IIndicatorCalculationStrategy } from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

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
    strategies: IIndicatorCalculationStrategy[],
  ): Promise<any> {
    const query = this.impactQueryBuilder.buildQuery(strategies);
    try {
      // TODO: comment out for testing final query
      return query;
      // return await this.entityManager.query(query);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
