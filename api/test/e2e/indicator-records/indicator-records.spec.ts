import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createIndicator,
  createIndicatorRecord,
  createSourcingRecord,
} from '../../entity-mocks';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';

/**
 * Tests for the IndicatorRecordsModule.
 */

describe('IndicatorRecordsModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await indicatorRecordRepository.delete({});
  });

  afterAll(async () => {
    await clearEntityTables(dataSource, [
      User,
      MaterialToH3,
      Material,
      SourcingRecord,
    ]);
    await app.close();
  });

  describe.skip('Indicator record - Create', () => {
    test('Create an indicator record should be successful (happy case)', async () => {
      const sourcingRecord: SourcingRecord = await createSourcingRecord();
      const indicator: Indicator = await createIndicator({
        nameCode: 'GAMMA_RADIATION',
      });
      const response = await request(app.getHttpServer())
        .post('/api/v1/indicator-records')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          value: 2000,
          indicatorId: indicator.id,
          sourcingRecordId: sourcingRecord.id,
        })
        .expect(HttpStatus.CREATED);

      const createdIndicatorRecord = await indicatorRecordRepository.findOne({
        where: { id: response.body.data.id },
      });

      if (!createdIndicatorRecord) {
        throw new Error('Error loading created Indicator Record');
      }

      expect(createdIndicatorRecord.value).toEqual(2000);
    });
  });

  test('Create a indicator records without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/indicator-records')
      .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorRecordRepository.findOne({
          where: { id: indicatorRecord.id },
        }),
      ).toBeNull();
    });
  });

  describe('Indicator records - Get all', () => {
    test('Get all indicator records should be successful (happy case)', async () => {
      const indicatorRecord: IndicatorRecord = await createIndicatorRecord();

      const response = await request(app.getHttpServer())
        .get('/api/v1/indicator-records')
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicatorRecord.id);
    });
  });
});
