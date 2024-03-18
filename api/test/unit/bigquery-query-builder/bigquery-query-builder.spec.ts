import { DataSource, SelectQueryBuilder } from 'typeorm';
import {
  BigQueryAlertsQueryBuilder,
  EUDR_ALERTS_DATABASE_FIELDS,
} from '../../../src/modules/eudr-alerts/alerts-query-builder/big-query-alerts-query.builder';
import { typeOrmConfig } from '../../../src/typeorm.config';

describe('BigQueryAlertsQueryBuilder', () => {
  let queryBuilder: SelectQueryBuilder<any>;
  const dataSource = new DataSource(typeOrmConfig);

  beforeEach(() => {
    queryBuilder = dataSource.createQueryBuilder().from('falsetable', 'alerts');
  });
  test('without DTO parameters should return a select with table name and alias', () => {
    const bigQueryBuilder = new BigQueryAlertsQueryBuilder(queryBuilder);
    const result = bigQueryBuilder.buildQuery();
    expect(result.query).toBe('SELECT * FROM falsetable alerts');
    expect(result.params).toEqual([]);
  });

  test('with date range parameters should add a where statement with parsed DATE formats', () => {
    const bigQueryBuilder = new BigQueryAlertsQueryBuilder(queryBuilder, {
      startAlertDate: new Date('2020-01-01'),
      endAlertDate: new Date('2020-01-31'),
    });
    const result = bigQueryBuilder.buildQuery();
    expect(result.query).toContain(
      `WHERE DATE(${EUDR_ALERTS_DATABASE_FIELDS.alertDate}) BETWEEN DATE(?) AND DATE(?)`,
    );
  });

  test('with a single supplier id should add a WHERE IN statement with a single parameter', () => {
    const bigQueryBuilder = new BigQueryAlertsQueryBuilder(queryBuilder, {
      supplierIds: ['supplier1'],
    });
    const result = bigQueryBuilder.buildQuery();
    expect(result.query).toContain('WHERE supplierid IN (?)');
    expect(result.params).toEqual(['supplier1']);
  });

  test('with 2 supplier id should add a WHERE IN statement with 2 parameters', () => {
    const bigQueryBuilder = new BigQueryAlertsQueryBuilder(queryBuilder, {
      supplierIds: ['supplier1', 'supplier2'],
    });
    const result = bigQueryBuilder.buildQuery();
    expect(result.query).toContain('WHERE supplierid IN (?, ?)');
    expect(result.params).toEqual(['supplier1', 'supplier2']);
  });
});
