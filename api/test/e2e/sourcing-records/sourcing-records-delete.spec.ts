import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Sourcing records - Delete', () => {
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

  test('Delete a sourcing record should be successful (happy case)', async () => {
    const sourcingRecord: SourcingRecord = await createSourcingRecord();

    await request(app.getHttpServer())
      .delete(`/api/v1/sourcing-records/${sourcingRecord.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(
      await sourcingRecordRepository.findOne({
        where: { id: sourcingRecord.id },
      }),
    ).toBeNull();
  });
});
