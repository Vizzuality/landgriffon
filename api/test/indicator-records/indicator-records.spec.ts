import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createIndicator,
  createIndicatorRecord,
  createSourcingRecord,
} from '../entity-mocks';
import { IndicatorRecordsModule } from '../../src/modules/indicator-records/indicator-records.module';
import { IndicatorRecordRepository } from '../../src/modules/indicator-records/indicator-record.repository';
import { IndicatorRecord } from '../../src/modules/indicator-records/indicator-record.entity';
import { Indicator } from '../../src/modules/indicators/indicator.entity';
import { SourcingRecord } from '../../src/modules/sourcing-records/sourcing-record.entity';

/**
 * Tests for the IndicatorRecordsModule.
 */

describe('IndicatorRecordsModule (e2e)', () => {
  let app: INestApplication;
  let indicatorRecordRepository: IndicatorRecordRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorRecordsModule],
    }).compile();

    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
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
    await indicatorRecordRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Indicator record - Create', () => {
    test('Create an indicator record should be successful (happy case)', async () => {
      const sourcingRecord: SourcingRecord = await createSourcingRecord();
      const indicator: Indicator = await createIndicator();
      const response = await request(app.getHttpServer())
        .post('/api/v1/indicator-records')
        .send({
          value: 2000,
          indicatorId: indicator.id,
          sourcingRecordId: sourcingRecord.id,
        })
        .expect(HttpStatus.CREATED);

      const createdIndicatorRecord = await indicatorRecordRepository.findOne(
        response.body.data.id,
      );

      if (!createdIndicatorRecord) {
        throw new Error('Error loading created Indicator Record');
      }

      expect(createdIndicatorRecord.value).toEqual(2000);
    });
  });

  test('Create a indicator records without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/indicator-records')
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'value should not be empty',
        'value must be a number conforming to the specified constraints',
        'indicatorId should not be empty',
        'indicatorId must be a string',
      ],
    );
  });

  describe('Indicator records - Update', () => {
    test('Update a indicator records should be successful (happy case)', async () => {
      const indicatorRecord: IndicatorRecord = await createIndicatorRecord();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/indicator-records/${indicatorRecord.id}`)
        .send({
          value: 2001,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.value).toEqual(2001);
    });
  });

  describe('Indicator records - Delete', () => {
    test('Delete a indicator records should be successful (happy case)', async () => {
      const indicatorRecord: IndicatorRecord = await createIndicatorRecord();

      await request(app.getHttpServer())
        .delete(`/api/v1/indicator-records/${indicatorRecord.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorRecordRepository.findOne(indicatorRecord.id),
      ).toBeUndefined();
    });
  });

  describe('Indicator records - Get all', () => {
    test('Get all indicator records should be successful (happy case)', async () => {
      const indicatorRecord: IndicatorRecord = await createIndicatorRecord();

      const response = await request(app.getHttpServer())
        .get('/api/v1/indicator-records')
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(indicatorRecord.id);
    });
  });

  describe('Indicator records - Get by id', () => {
    test('Get a indicator record by id should be successful (happy case)', async () => {
      const indicatorRecord: IndicatorRecord = await createIndicatorRecord();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-records/${indicatorRecord.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicatorRecord.id);
    });
  });
});
