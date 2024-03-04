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
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import {
  EUDRAlertDates,
  GetEUDRAlertDatesDto,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';
import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { BigQueryAlertsQueryBuilder } from 'modules/eudr-alerts/alerts-query-builder/big-query-alerts-query.builder';

const projectId: string = 'carto-dw-ac-zk2uhih6';

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
    const queryBuilder: SelectQueryBuilder<AlertsOutput> =
      this.dataSource.createQueryBuilder();
    // TODO: Make field selection dynamic
    queryBuilder.from(this.baseDataset, 'alerts');
    queryBuilder.select('alertdate', 'alertDate');
    queryBuilder.addSelect('alertconfidence', 'alertConfidence');
    queryBuilder.addSelect('year', 'alertYear');
    queryBuilder.addSelect('alertcount', 'alertCount');
    try {
      const response: SimpleQueryRowsResponse = await this.bigQueryClient.query(
        this.buildQuery(queryBuilder, dto),
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

  getDates(dto: GetEUDRAlertDatesDto): Promise<EUDRAlertDates[]> {
    return [] as any;
  }

  private buildQuery(
    queryBuilder: SelectQueryBuilder<AlertsOutput>,
    dto?: GetEUDRAlertsDto,
  ): Query {
    const alertsQueryBuilder: BigQueryAlertsQueryBuilder =
      new BigQueryAlertsQueryBuilder(queryBuilder, dto);

    return alertsQueryBuilder.buildQuery();
  }
}
