import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';

/**
 * Tests for the SourcingRecordsModule.
 */

describe('SourcingRecordsModule (e2e)', () => {
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

  describe('Sourcing records - Create', () => {
    test('Create a sourcing record should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-records')
        .send({
          tonnage: 1234,
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

  describe('Sourcing records - Update', () => {
    test('Update a sourcing record should be successful (happy case)', async () => {
      const sourcingRecord: SourcingRecord = new SourcingRecord();
      sourcingRecord.tonnage = 1234;
      await sourcingRecord.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sourcing-records/${sourcingRecord.id}`)
        .send({
          tonnage: 5678,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.tonnage).toEqual(5678);
    });
  });

  describe('Sourcing records - Delete', () => {
    test('Delete a sourcing record should be successful (happy case)', async () => {
      const sourcingRecord: SourcingRecord = new SourcingRecord();
      sourcingRecord.tonnage = 1234;
      await sourcingRecord.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/sourcing-records/${sourcingRecord.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await sourcingRecordRepository.findOne(sourcingRecord.id),
      ).toBeUndefined();
    });
  });

  describe('Sourcing records - Get all', () => {
    test('Get all sourcing records should be successful (happy case)', async () => {
      const sourcingRecord: SourcingRecord = new SourcingRecord();
      sourcingRecord.tonnage = 1234;
      await sourcingRecord.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-records`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(sourcingRecord.id);
    });
  });

  describe('Sourcing records - Get by id', () => {
    test('Get a sourcing record by id should be successful (happy case)', async () => {
      const sourcingRecord: SourcingRecord = new SourcingRecord();
      sourcingRecord.tonnage = 1234;
      await sourcingRecord.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-records/${sourcingRecord.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(sourcingRecord.id);
    });
  });
});
