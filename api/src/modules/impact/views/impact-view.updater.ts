import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IMPACT_VIEW_NAME } from 'modules/impact/views/impact.materialized-view.entity';

@Injectable()
export class ImpactViewUpdater {
  logger: Logger = new Logger(ImpactViewUpdater.name);

  constructor(private readonly dataSource: DataSource) {}

  async updateImpactView(): Promise<void> {
    if (await this.isViewEmpty()) {
      return this.populateViewForTheFirstTime();
    }
    return this.refreshView();
  }

  private async isViewEmpty(): Promise<boolean> {
    const result: any = await this.dataSource.query(
      `SELECT * FROM pg_matviews WHERE matviewname = '${IMPACT_VIEW_NAME}'`,
    );
    return !result[0].ispopulated;
  }

  private async populateViewForTheFirstTime(): Promise<void> {
    this.logger.warn('Populating Impact View for the first time...');
    return this.dataSource.query(
      `REFRESH MATERIALIZED VIEW ${IMPACT_VIEW_NAME} WITH DATA`,
    );
  }

  private async refreshView(): Promise<void> {
    this.logger.warn('Refreshing Impact View...');
    return this.dataSource.query(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY ${IMPACT_VIEW_NAME} WITH DATA`,
    );
  }
}
