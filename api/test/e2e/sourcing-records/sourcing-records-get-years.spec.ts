import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records - Get years', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let sourcingRecordRepository: SourcingRecordRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    sourcingRecordRepository = testApplication.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await sourcingRecordRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('Get years from sourcing records should be successful and return the years present in the sourcing records (no duplicates)', async () => {
    await createSourcingRecord({ year: 2001 });
    await createSourcingRecord({ year: 2001 });
    await createSourcingRecord({ year: 2002 });
    await createSourcingRecord({ year: 2002 });
    await createSourcingRecord({ year: 2003 });
    await createSourcingRecord({ year: 2007 });

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/sourcing-records/years`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });

  test('Get years from sourcing records should be successful and return an empty array if there are no sourcing records', async () => {
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/sourcing-records/years`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([]);
  });
});
