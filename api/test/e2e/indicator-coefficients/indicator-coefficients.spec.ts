import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorCoefficientsModule } from 'modules/indicator-coefficients/indicator-coefficients.module';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';

import { createIndicatorCoefficient } from '../../entity-mocks';
import { saveAdminAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

/**
 * Tests for the IndicatorCoefficientsModule.
 */

describe('IndicatorCoefficientsModule (e2e)', () => {
  let app: INestApplication;
  let indicatorCoefficientRepository: IndicatorCoefficientRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorCoefficientsModule],
    }).compile();

    indicatorCoefficientRepository =
      moduleFixture.get<IndicatorCoefficientRepository>(
        IndicatorCoefficientRepository,
      );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveAdminAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await indicatorCoefficientRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Indicator coefficients - Create', () => {
    test('Create an indicator coefficient should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/indicator-coefficients')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          year: 2000,
        })
        .expect(HttpStatus.CREATED);

      const createdIndicatorCoefficient =
        await indicatorCoefficientRepository.findOne(response.body.data.id);

      if (!createdIndicatorCoefficient) {
        throw new Error('Error loading created Indicator Coefficient');
      }

      expect(createdIndicatorCoefficient.year).toEqual(2000);
    });
  });

  test('Create a indicator coefficient without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/indicator-coefficients')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'year should not be empty',
        'year must be a number conforming to the specified constraints',
      ],
    );
  });

  describe('Indicator coefficients - Update', () => {
    test('Update a indicator coefficient should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient =
        await createIndicatorCoefficient();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          year: 2001,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.year).toEqual(2001);
    });
  });

  describe('Indicator coefficients - Delete', () => {
    test('Delete a indicator coefficient should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient =
        await createIndicatorCoefficient();

      await request(app.getHttpServer())
        .delete(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorCoefficientRepository.findOne(indicatorCoefficient.id),
      ).toBeUndefined();
    });
  });

  describe('Indicator coefficients - Get all', () => {
    test('Get all indicator coefficients should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient =
        await createIndicatorCoefficient();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-coefficients`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(indicatorCoefficient.id);
    });
  });

  describe('Indicator coefficients - Get by id', () => {
    test('Get a indicator coefficient by id should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient =
        await createIndicatorCoefficient();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicatorCoefficient.id);
    });
  });
});
