import { createIndicatorRecord } from '../../../entity-mocks';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Material } from 'modules/materials/material.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../../utils/database-test-helper';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { DataSource } from 'typeorm';
import AppSingleton from '../../../utils/getApp';
import { INestApplication } from '@nestjs/common';

describe('Indicator Records Service', () => {
  let dataSource: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
      IndicatorRecord,
      SourcingRecord,
      MaterialToH3,
      Material,
      H3Data,
    ]);
  });

  afterAll(async () => {
    await app.close();
    await clearTestDataFromDatabase(dataSource);
  });

  test('When I want to save a calculated impact, But this impact has a NaN value, Then I should not be able to persist it in the database', async () => {
    const indicatorRecord = await createIndicatorRecord({
      value: NaN,
    }).catch((e: any) => e);

    const indicatorRecords: IndicatorRecord[] = await dataSource
      .getRepository(IndicatorRecord)
      .find();

    expect(indicatorRecord.value).toBeUndefined();
    expect(indicatorRecord.scaler).toBeUndefined();
    expect(indicatorRecords).toHaveLength(0);
  });
});
