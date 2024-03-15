import {
  BigQuery,
  Query,
  SimpleQueryRowsResponse,
} from '@google-cloud/bigquery';
import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import {
  EUDRAlertDatabaseResult,
  EUDRAlertDates,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';
import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { BigQueryAlertsQueryBuilder } from 'modules/eudr-alerts/alerts-query-builder/big-query-alerts-query.builder';

const projectId: string = 'carto-dw-ac-zk2uhih6';

export enum EUDRAlertsFields {
  alertDate = 'alertdate',
  alertConfidence = 'alertconfidence',
  year = 'year',
  alertCount = 'alertcount',
  geoRegionId = 'georegionid',
  supplierId = 'supplierid',
}

@Injectable()
export class AlertsRepository implements IEUDRAlertsRepository {
  logger: Logger = new Logger(AlertsRepository.name);
  bigQueryClient: BigQuery;

  constructor(
    private readonly dataSource: DataSource,
    @Inject('EUDRCredentials') private credentials: string,
    @Inject('EUDRDataset') private baseDataset: string,
  ) {
    // if (!credentials) {
    //   this.logger.error('BigQuery credentials are missing');
    //   throw new ServiceUnavailableException(
    //     'EUDR Module not available. Tearing down the application',
    //   );
    // }
    this.bigQueryClient = new BigQuery({
      credentials: JSON.parse(this.credentials),
      projectId,
    });
  }

  async getAlerts(dto?: GetEUDRAlertsDto): Promise<AlertsOutput[]> {
    const queryBuilder: BigQueryAlertsQueryBuilder =
      this.createQueryBuilder(dto);
    // TODO: Make field selection dynamic
    queryBuilder.from(this.baseDataset, 'alerts');
    queryBuilder.select('alertdate', 'alertDate');
    queryBuilder.addSelect('alertconfidence', 'alertConfidence');
    queryBuilder.addSelect('year', 'alertYear');
    queryBuilder.addSelect('alertcount', 'alertCount');
    queryBuilder.addSelect('georegionid', 'geoRegionId');
    queryBuilder.orderBy('alertdate', 'ASC');
    return this.query(queryBuilder);
  }

  async getDates(dto: GetEUDRAlertsDto): Promise<EUDRAlertDates[]> {
    const queryBuilder: BigQueryAlertsQueryBuilder =
      this.createQueryBuilder(dto);
    queryBuilder.from(this.baseDataset, 'alerts');
    queryBuilder.select('alertdate', 'alertDate');
    queryBuilder.orderBy('alertdate', 'ASC');
    queryBuilder.groupBy('alertdate');
    return this.query(queryBuilder);
  }

  async getAlertSummary(dto: any): Promise<EUDRAlertDatabaseResult[]> {
    const bigQueryBuilder: BigQueryAlertsQueryBuilder =
      this.createQueryBuilder(dto);
    bigQueryBuilder
      .from(this.baseDataset, 'alerts')
      .select('supplierid', 'supplierId')
      .addSelect(
        'SUM(CASE WHEN alertcount = 0 THEN 1 ELSE 0 END)',
        'zero_alerts',
      )
      .addSelect(
        'SUM(CASE WHEN alertcount > 0 THEN 1 ELSE 0 END)',
        'nonzero_alerts',
      )
      .addSelect('COUNT(*)', 'total_geo_regions')
      .groupBy('supplierid');

    const mainQueryBuilder: BigQueryAlertsQueryBuilder =
      this.createQueryBuilder();

    mainQueryBuilder
      .select('supplierid')
      .addSelect(
        '(CAST(zero_alerts AS FLOAT64) / NULLIF(total_geo_regions, 0)) * 100',
        'dfs',
      )
      .addSelect(
        '(CAST(nonzero_alerts AS FLOAT64) / NULLIF(total_geo_regions, 0)) * 100',
        'sda',
      )
      .from('(' + bigQueryBuilder.getQuery() + ')', 'alerts_summary')
      .setParameters(bigQueryBuilder.getParameters());

    return this.query(mainQueryBuilder);
  }

  private async query(queryBuilder: BigQueryAlertsQueryBuilder): Promise<any> {
    try {
      const response: SimpleQueryRowsResponse = await this.bigQueryClient.query(
        queryBuilder.buildQuery(),
      );
      if (!response.length || 'error' in response) {
        this.logger.error('Error in query', response);
        throw new Error();
      }
      return response[0];
    } catch (e) {
      this.logger.error('Error in query', e);
      throw new ServiceUnavailableException(
        'Unable to retrieve EUDR Data. Please contact your administrator.',
      );
    }
  }

  private createQueryBuilder(
    dto?: GetEUDRAlertsDto,
  ): BigQueryAlertsQueryBuilder {
    return new BigQueryAlertsQueryBuilder(
      this.dataSource.createQueryBuilder(),
      dto,
    );
  }
}
