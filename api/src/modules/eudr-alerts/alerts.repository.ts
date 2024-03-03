import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { AlertsOutput } from './dto/alerts-output.dto';
import { ResourceStream } from '@google-cloud/paginator';
import { RowMetadata } from '@google-cloud/bigquery/build/src/table';
import { IEUDRAlertsRepository } from './eudr.repositoty.interface';
import { AppConfig } from '../../utils/app.config';

const projectId: string = 'carto-dw-ac-zk2uhih6';

const limit: number = 1;

@Injectable()
export class AlertsRepository implements IEUDRAlertsRepository {
  bigQueryClient: BigQuery;
  BASE_DATASET: string = 'cartobq.eudr.dev_mock_data_optimized';

  constructor(private readonly dataSource: DataSource) {
    const { credentials } = AppConfig.get('carto');
    this.bigQueryClient = new BigQuery({
      credentials: JSON.parse(credentials),
      projectId,
    });
  }

  select(dto?: any): ResourceStream<RowMetadata> {
    const queryBuilder: SelectQueryBuilder<AlertsOutput> = this.dataSource
      .createQueryBuilder()
      .select('georegionid', 'geoRegionId')
      .addSelect('supplierid', 'supplierId')
      .addSelect('geometry', 'geometry')
      .where('alertcount >= :alertCount', { alertCount: 2 })
      .andWhere('supplierid IN (:...supplierIds)', {
        supplierIds: [
          '4132ab95-8b04-4438-b706-a82651f491bd',
          '4132ab95-8b04-4438-b706-a82651f491bd',
          '4132ab95-8b04-4438-b706-a82651f491bd',
        ],
      });
    if (limit) {
      queryBuilder.limit(limit);
    }
    // const [rows] = await this.bigQueryClient.query(
    //   this.buildQuery(queryBuilder),
    // );
    return this.bigQueryClient.createQueryStream(this.buildQuery(queryBuilder));
  }

  private buildQuery(queryBuilder: SelectQueryBuilder<AlertsOutput>): {
    query: string;
    params: any[];
  } {
    const [query, params] = queryBuilder
      .from(this.BASE_DATASET, 'alerts')
      .getQueryAndParameters();
    const queryOptions = {
      query: query.replace(/\$\d+|"/g, (match: string) =>
        match === '"' ? '' : '?',
      ),
      params,
    };
    return queryOptions;
  }
}
