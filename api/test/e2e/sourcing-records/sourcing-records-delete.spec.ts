import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../../entity-mocks';

describe('Sourcing records - Delete', () => {
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
    await app.close();
  });

  test('Delete a sourcing record should be successful (happy case)', async () => {
    const sourcingRecord: SourcingRecord = await createSourcingRecord();

    await request(app.getHttpServer())
      .delete(`/api/v1/sourcing-records/${sourcingRecord.id}`)
      .send()
      .expect(HttpStatus.OK);

    expect(
      await sourcingRecordRepository.findOne(sourcingRecord.id),
    ).toBeUndefined();
  });
});
