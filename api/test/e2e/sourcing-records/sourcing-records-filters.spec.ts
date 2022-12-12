import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import {
  createSourcingLocation,
  createSourcingRecord,
} from '../../entity-mocks';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records -Filters', () => {
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

  /**
   * @debt: Right now we can add sourcing-data with no sourcing-location. This opens a door with new many use cases that worth testing,
   * but we will most likely restrict this behaviour, and related test will require an update
   * That's the reason I see no value adding these use cases
   */

  test('When I fetch a sourcing-record and I include its sourcing-location relation in the query, then I should receive said sourcing-record and its sourcing-location', async () => {
    const sourcingLocation: SourcingLocation = await createSourcingLocation();
    const sourcingRecord: SourcingRecord = await createSourcingRecord({
      sourcingLocation: sourcingLocation,
    });
    const response = await request(testApplication.getHttpServer())
      .get(
        `/api/v1/sourcing-records/${sourcingRecord.id}?include=sourcingLocation`,
      )
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data.attributes.sourcingLocation).toMatchObject({
      ...sourcingLocation,
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
