import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

describe('Sourcing records - Create', () => {
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
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await sourcingRecordRepository.delete({});
  });
  afterAll(async () => {
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

    const createdSourcingRecord = await sourcingRecordRepository.findOne(
      response.body.data.id,
    );

    if (!createdSourcingRecord) {
      throw new Error('Error loading created Sourcing Record');
    }

    expect(createdSourcingRecord.tonnage).toEqual('1234');
  });
});
