import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import {
  createSourcingLocation,
  createSourcingRecord,
} from '../../entity-mocks';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records - Get by id', () => {
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

  test('Get a sourcing record by id should be successful (happy case)', async () => {
    const sourcingRecord: SourcingRecord = await createSourcingRecord();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-records/${sourcingRecord.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data.id).toEqual(sourcingRecord.id);
  });

  /**
   * @debt: Right now we can add sourcing-data with no sourcing-location. This opens a door with new many use cases that worth testing
   * but we will most likely restrict this behaviour, and related test will require an update
   * Thats the reason I see no value adding these use cases
   */

  test('When I fetch a sourcing-record and I include its sourcing-location relation in the query, then I should receive said sourcing-record and its sourcing-location', async () => {
    const sourcingLocation: SourcingLocation = await createSourcingLocation();
    const sourcingRecord: SourcingRecord = await createSourcingRecord({
      sourcingLocation: sourcingLocation,
    });
    const response = await request(app.getHttpServer())
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
