import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records - Get years', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sourcingRecordRepository: SourcingRecordRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await sourcingRecordRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });

  test('Get years from sourcing records should be successful and return the years present in the sourcing records (no duplicates)', async () => {
    await createSourcingRecord({ year: 2001 });
    await createSourcingRecord({ year: 2001 });
    await createSourcingRecord({ year: 2002 });
    await createSourcingRecord({ year: 2002 });
    await createSourcingRecord({ year: 2003 });
    await createSourcingRecord({ year: 2007 });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-records/years`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });

  test('Get years from sourcing records should be successful and return an empty array if there are no sourcing records', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-records/years`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([]);
  });
});
