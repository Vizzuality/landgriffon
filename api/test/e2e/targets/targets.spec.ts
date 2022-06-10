import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Target } from 'modules/targets/target.entity';
import { TargetsModule } from 'modules/targets/targets.module';
import { TargetsRepository } from 'modules/targets/targets.repository';
import { createIndicator, createTarget } from '../../entity-mocks';
import { Indicator } from 'modules/indicators/indicator.entity';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';

/**
 * Tests for Targets Module.
 */

describe('Tasks Module (e2e)', () => {
  let app: INestApplication;
  let targetsRepository: TargetsRepository;
  let indicatorRepository: IndicatorRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TargetsModule],
    }).compile();

    targetsRepository = moduleFixture.get<TargetsRepository>(TargetsRepository);
    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);

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
    jest.clearAllMocks();
    await targetsRepository.delete({});
    await indicatorRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Targets - Create', () => {
    test('Creating a new target (happy case)', async () => {
      const indicator: Indicator = await createIndicator({
        nameCode: 'GAMMA_RADIATION',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/targets')
        .send({
          baseLineYear: 2020,
          targetYear: 2023,
          value: 10,
          indicatorId: indicator.id,
        })
        .expect(HttpStatus.CREATED);

      const createdTarget = await targetsRepository.findOne(
        response.body.data.id,
      );

      if (!createdTarget) {
        throw new Error('Error loading created Target');
      }

      expect(createdTarget.indicatorId).toEqual(indicator.id);
      expect(createdTarget.baseLineYear).toEqual(2020);
    });
  });

  test('Creating a target without required fields should return a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/targets')
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'baseLineYear should not be empty',
        'baseLineYear must be a number conforming to the specified constraints',
        'targetYear should not be empty',
        'targetYear must be a number conforming to the specified constraints',
        'value should not be empty',
        'value must be a number conforming to the specified constraints',
        'indicatorId should not be empty',
        'indicatorId must be a string',
      ],
    );
  });

  describe('Targets - Update', () => {
    test('Updating a target should be successful (happy case)', async () => {
      const target: Target = await createTarget();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/targets/${target.id}`)
        .send({
          targetYear: 2025,
          value: 30,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.targetYear).toEqual(2025);
      expect(response.body.data.attributes.value).toEqual(30);
    });

    test('Updating a task without task id should return proper error message', async () => {
      await createTarget();

      await request(app.getHttpServer())
        .patch(`/api/v1/targets`)
        .send()
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Target - Delete', () => {
    test('Deleting a target should be successful (happy case)', async () => {
      const target: Target = await createTarget();

      await request(app.getHttpServer())
        .delete(`/api/v1/targets/${target.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await targetsRepository.findOne(target.id)).toBeUndefined();
    });
  });

  describe('Target - Find all', () => {
    test('Retrieving all targets should be successful (happy case)', async () => {
      const target1: Target = await createTarget({
        baseLineYear: 2018,
      });
      const target2: Target = await createTarget({
        value: 22,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/targets`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(target1.id);
      expect(response.body.data[0].attributes.baseLineYear).toEqual(2018);
      expect(response.body.data[0].attributes.value).toEqual(10);
      expect(response.body.data[1].id).toEqual(target2.id);
      expect(response.body.data[1].attributes.value).toEqual(22);
      expect(response.body.data[1].attributes.baseLineYear).toEqual(2020);
    });
  });

  describe('Target - Get by id', () => {
    test('Retrieving a target by id should be successful (happy case)', async () => {
      const target: Target = await createTarget({
        targetYear: 2024,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/targets/${target.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(target.id);
      expect(response.body.data.attributes.targetYear).toEqual(2024);
    });
  });
});
