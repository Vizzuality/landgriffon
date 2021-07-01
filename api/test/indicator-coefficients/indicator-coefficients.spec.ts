import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorCoefficientsModule } from 'modules/indicator-coefficients/indicator-coefficients.module';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';

/**
 * Tests for the IndicatorCoefficientsModule.
 */

describe('IndicatorCoefficientsModule (e2e)', () => {
  let app: INestApplication;
  let indicatorRepository: IndicatorCoefficientRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorCoefficientsModule],
    }).compile();

    indicatorRepository = moduleFixture.get<IndicatorCoefficientRepository>(
      IndicatorCoefficientRepository,
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
    await indicatorRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Indicator coefficients - Create', () => {
    test('Create a indicator should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/indicator-coefficients')
        .send({
          year: 2000,
        })
        .expect(HttpStatus.CREATED);

      const createdIndicatorCoefficient = await indicatorRepository.findOne(
        response.body.data.id,
      );

      if (!createdIndicatorCoefficient) {
        throw new Error('Error loading created Indicator Coefficient');
      }

      expect(createdIndicatorCoefficient.year).toEqual(2000);
    });
  });

  describe('Indicator coefficients - Update', () => {
    test('Update a indicator coefficient should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient = new IndicatorCoefficient();
      indicatorCoefficient.year = 2000;
      await indicatorCoefficient.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .send({
          year: 2001,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.year).toEqual(2001);
    });
  });

  describe('Indicator coefficients - Delete', () => {
    test('Delete a indicator coefficient should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient = new IndicatorCoefficient();
      indicatorCoefficient.year = 2000;
      await indicatorCoefficient.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorRepository.findOne(indicatorCoefficient.id),
      ).toBeUndefined();
    });
  });

  describe('Indicator coefficients - Get all', () => {
    test('Get all indicator coefficients should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient = new IndicatorCoefficient();
      indicatorCoefficient.year = 2000;
      await indicatorCoefficient.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-coefficients`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(indicatorCoefficient.id);
    });
  });

  describe('Indicator coefficients - Get by id', () => {
    test('Get a indicator coefficient by id should be successful (happy case)', async () => {
      const indicatorCoefficient: IndicatorCoefficient = new IndicatorCoefficient();
      indicatorCoefficient.year = 2000;
      await indicatorCoefficient.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-coefficients/${indicatorCoefficient.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicatorCoefficient.id);
    });
  });
});
