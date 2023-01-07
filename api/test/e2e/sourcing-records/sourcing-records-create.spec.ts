import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records - Create', () => {
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

  test('Create a sourcing record should be successful (happy case)', async () => {
    const response = await request(app.getHttpServer())
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
