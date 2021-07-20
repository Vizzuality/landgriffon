import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../entity-mocks';

describe('Sourcing records - Get by id', () => {
  let app: INestApplication;
  let sourcingRecordRepository: SourcingRecordRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
    }).compile();

    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await sourcingRecordRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('Get a sourcing record by id should be successful (happy case)', async () => {
    const sourcingRecord: SourcingRecord = await createSourcingRecord();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-records/${sourcingRecord.id}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data.id).toEqual(sourcingRecord.id);
  });
});
