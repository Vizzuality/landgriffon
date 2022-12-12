import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records - Create', () => {
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

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await sourcingRecordRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('Create a sourcing record should be successful (happy case)', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/sourcing-records')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        tonnage: 1234,
        year: 2020,
      })
      .expect(HttpStatus.CREATED);

    const createdSourcingRecord = await sourcingRecordRepository.findOne({
      where: { id: response.body.data.id },
    });

    if (!createdSourcingRecord) {
      throw new Error('Error loading created Sourcing Record');
    }

    expect(createdSourcingRecord.tonnage).toEqual('1234');
  });
});
