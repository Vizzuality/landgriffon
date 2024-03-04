import { SelectQueryBuilder } from 'typeorm';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { Query } from '@google-cloud/bigquery';

export class BigQueryAlertsQueryBuilder {
  queryBuilder: SelectQueryBuilder<AlertsOutput>;
  dto?: GetEUDRAlertsDto;

  constructor(
    queryBuilder: SelectQueryBuilder<AlertsOutput>,
    getAlertsDto?: GetEUDRAlertsDto,
  ) {
    this.queryBuilder = queryBuilder;
    this.dto = getAlertsDto;
  }

  buildQuery(): Query {
    if (this.dto?.supplierIds) {
      this.queryBuilder.andWhere('supplierid IN (:...supplierIds)', {
        supplierIds: this.dto.supplierIds,
      });
    }
    if (this.dto?.geoRegionIds) {
      this.queryBuilder.andWhere('georegionid IN (:...geoRegionIds)', {
        geoRegionIds: this.dto.geoRegionIds,
      });
    }
    if (this.dto?.alertConfidence) {
      this.queryBuilder.andWhere('alertConfidence = :alertConfidence', {
        alertConfidence: this.dto.alertConfidence,
      });
    }

    if (this.dto?.startYear && this.dto?.endYear) {
      this.addYearRange();
    } else if (this.dto?.startYear) {
      this.addYearGreaterThanOrEqual();
    } else if (this.dto?.endYear) {
      this.addYearLessThanOrEqual();
    }

    if (this.dto?.startAlertDate && this.dto?.endAlertDate) {
      this.addAlertDateRange();
    } else if (this.dto?.startAlertDate) {
      this.addAlertDateGreaterThanOrEqual();
    } else if (this.dto?.endAlertDate) {
      this.addAlertDateLessThanOrEqual();
    }

    this.queryBuilder.limit(this.dto?.limit);

    const [query, params] = this.queryBuilder.getQueryAndParameters();

    return this.parseToBigQuery(query, params);
  }

  addYearRange(): void {
    this.queryBuilder.andWhere('year BETWEEN :startYear AND :endYear', {
      startYear: this.dto?.startYear,
      endYear: this.dto?.endYear,
    });
  }

  addYearGreaterThanOrEqual(): void {
    this.queryBuilder.andWhere('year >= :startYear', {
      startYear: this.dto?.startYear,
    });
  }

  addYearLessThanOrEqual(): void {
    this.queryBuilder.andWhere('year <= :endYear', {
      endYear: this.dto?.endYear,
    });
  }

  addAlertDateRange(): void {
    this.queryBuilder.andWhere(
      'DATE(alertdate) BETWEEN :startAlertDate AND :endAlertDate',
      {
        startAlertDate: this.dto?.startAlertDate,
        endAlertDate: this.dto?.endAlertDate,
      },
    );
  }

  addAlertDateGreaterThanOrEqual(): void {
    this.queryBuilder.andWhere('DATE(alertdate) >= DATE(:startAlertDate)', {
      startAlertDate: this.dto?.startAlertDate,
    });
  }

  addAlertDateLessThanOrEqual(): void {
    this.queryBuilder.andWhere('DATE(alertDate) <= :DATE(endAlertDate)', {
      endAlertDate: this.dto?.endAlertDate,
    });
  }

  parseToBigQuery(query: string, params: any[]): Query {
    return {
      query: this.removeDoubleQuotesAndReplacePositionalArguments(query),
      params,
    };
  }

  /**
   * @description: BigQuery does not allow double quotes and the positional argument symbol must be a "?".
   * So there is a need to replace the way TypeORM handles the positional arguments, with $1, $2, etc.
   */

  private removeDoubleQuotesAndReplacePositionalArguments(
    query: string,
  ): string {
    return query.replace(/\$\d+|"/g, (match: string) =>
      match === '"' ? '' : '?',
    );
  }
}
