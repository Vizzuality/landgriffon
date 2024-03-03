import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { DataSource, QueryBuilder, SelectQueryBuilder } from 'typeorm';
import { AlertsOutput } from './dto/alerts-output.dto';
import { SA } from './SA';
import { ResourceStream } from '@google-cloud/paginator';
import { RowMetadata } from '@google-cloud/bigquery/build/src/table';

const projectId: string = 'carto-dw-ac-zk2uhih6';

const BASE_QUERY: string = `SELECT * FROM cartobq.eudr.mock_data LIMIT 1`;

const BASE_DATASET: string = 'cartobq.eudr.dev_mock_data_optimized';

const limit: number = 1;

@Injectable()
export class AlertsRepository {
  bigQueryClient: BigQuery;
  BASE_DATASET: string = 'cartobq.eudr.dev_mock_data_optimized';

  constructor(private readonly dataSource: DataSource) {
    //TODO: Implement error handling for missing service account file

    this.bigQueryClient = new BigQuery({
      credentials: SA,
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
