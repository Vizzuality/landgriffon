import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';

import { createIndicatorRecord } from '../../../entity-mocks';

import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';

import { Material } from 'modules/materials/material.entity';

import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';

import { H3Data } from 'modules/h3-data/h3-data.entity';
import { clearEntityTables } from '../../../utils/database-test-helper';
import { MaterialToH3 } from '../../../../src/modules/materials/material-to-h3.entity';

import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { getConnection } from 'typeorm';

describe('Indicator Records Service', () => {
  let testingModule: TestingModule;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorRecordsModule],
    }).compile();
  });

  afterEach(async () => {
    await clearEntityTables([
      IndicatorRecord,
      SourcingRecord,
      MaterialToH3,
      Material,
      H3Data,
    ]);
  });

  afterAll(() => testingModule.close());

  test('When I want to save a calculated impact, But this impact has a NaN value, Then I should not be able to persist it in the database', async () => {
    const indicatorRecord = await createIndicatorRecord({
      value: NaN,
    }).catch((e: any) => e);

    const indicatorRecords: IndicatorRecord[] = await getConnection()
      .getRepository(IndicatorRecord)
      .find();

    expect(indicatorRecord.value).toBeUndefined();
    expect(indicatorRecord.scaler).toBeUndefined();
    expect(indicatorRecords).toHaveLength(0);
  });
});
