import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';

import { createIndicatorCoefficient } from '../../entity-mocks';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

/**
 * Tests for the IndicatorCoefficientsModule.
 */

describe('IndicatorCoefficientsModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let indicatorCoefficientRepository: IndicatorCoefficientRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    indicatorCoefficientRepository =
      testApplication.get<IndicatorCoefficientRepository>(
        IndicatorCoefficientRepository,
      );

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await indicatorCoefficientRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Indicator coefficients - Create', () => {
    test('Create an indicator coefficient should be successful (happy case)', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/indicator-coefficients')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          year: 2000,
        })
        .expect(HttpStatus.CREATED);

      const createdIndicatorCoefficient =
        await indicatorCoefficientRepository.findOne({
          where: { id: response.body.data.id },
        });

      if (!createdIndicatorCoefficient) {
        throw new Error('Error loading created Indicator Coefficient');
      }

      expect(createdIndicatorCoefficient.year).toEqual(2000);
    });
  });

  test('Create a indicator coefficient without the required fields should fail with a 400 error', async () => {
    const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
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

      await request(testApplication.getHttpServer())
        .delete(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorCoefficientRepository.findOne({
          where: { id: indicatorCoefficient.id },
        }),
      ).toBeNull();
    });
  });

  describe('Indicator coefficients - Get all', () => {
    test('Get all indicator coefficients should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient =
        await createIndicatorCoefficient();

      const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicatorCoefficient.id);
    });
  });
});
