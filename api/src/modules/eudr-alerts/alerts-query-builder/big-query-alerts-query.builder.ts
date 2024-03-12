import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import { Query } from '@google-cloud/bigquery';
import { GetEUDRAlertsDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { EUDRAlertsFields } from 'modules/eudr-alerts/alerts.repository';

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

  getQuery(): string {
    return this.queryBuilder.getQuery();
  }

  getParameters(): ObjectLiteral {
    return this.queryBuilder.getParameters();
  }

  setParameters(parameters: ObjectLiteral): this {
    this.queryBuilder.setParameters(parameters);
    return this;
  }

  select(field: string, alias?: string): this {
    this.queryBuilder.select(field, alias);
    return this;
  }

  orderBy(field: string, order: 'ASC' | 'DESC'): this {
    this.queryBuilder.orderBy(field, order);
    return this;
  }

  getQueryBuilder(): SelectQueryBuilder<AlertsOutput> {
    return this.queryBuilder;
  }

  groupBy(fields: string): this {
    this.queryBuilder.groupBy(fields);
    return this;
  }

  from(table: string, alias: string): this {
    this.queryBuilder.from(table, alias);
    return this;
  }

  addSelect(fields: string, alias?: string): this {
    this.queryBuilder.addSelect(fields, alias);
    return this;
  }

  buildQuery(): Query {
    if (this.dto?.supplierIds) {
      this.queryBuilder.andWhere(
        `${EUDRAlertsFields.supplierId} IN (:...supplierIds)`,
        {
          supplierIds: this.dto.supplierIds,
        },
      );
    }
    if (this.dto?.geoRegionIds) {
      this.queryBuilder.andWhere(
        `${EUDRAlertsFields.geoRegionId} IN (:...geoRegionIds)`,
        {
          geoRegionIds: this.dto.geoRegionIds,
        },
      );
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
      'DATE(alertdate) BETWEEN DATE(:startAlertDate) AND DATE(:endAlertDate)',
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
