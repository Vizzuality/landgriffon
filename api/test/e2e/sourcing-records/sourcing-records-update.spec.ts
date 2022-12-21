import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../../entity-mocks';
import { saveAdminAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

describe('Sourcing records - Update', () => {
  let app: INestApplication;
  let sourcingRecordRepository: SourcingRecordRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
    }).compile();

    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveAdminAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await sourcingRecordRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('Update a sourcing record should be successful (happy case)', async () => {
    const sourcingRecord: SourcingRecord = await createSourcingRecord();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/sourcing-records/${sourcingRecord.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        tonnage: 5678,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.attributes.tonnage).toEqual(5678);
  });
});
