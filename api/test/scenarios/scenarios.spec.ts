import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';

/**
 * Tests for the ScenariosModule.
 */

describe('ScenariosModule (e2e)', () => {
  let app: INestApplication;
  let scenarioRepository: ScenarioRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ScenariosModule],
    }).compile();

    scenarioRepository = moduleFixture.get<ScenarioRepository>(
      ScenarioRepository,
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
    await scenarioRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Scenarios - Create', () => {
    test('Create a scenario should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .send({
          title: 'test scenario',
        })
        .expect(HttpStatus.CREATED);

      const createdScenario = await scenarioRepository.findOne(
        response.body.data.id,
      );

      if (!createdScenario) {
        throw new Error('Error loading created Scenario');
      }

      expect(createdScenario.title).toEqual('test scenario');
    });

    test('Create a scenario without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(HttpStatus.BAD_REQUEST, [
        'title should not be empty',
        'title must be shorter than or equal to 40 characters',
        'title must be longer than or equal to 2 characters',
        'title must be a string',
      ]);
    });
  });

  describe('Scenarios - Update', () => {
    test('Update a scenario should be successful (happy case)', async () => {
      const scenario: Scenario = new Scenario();
      scenario.title = 'test scenario';
      await scenario.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenario.id}`)
        .send({
          title: 'updated test scenario',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'updated test scenario',
      );
    });
  });

  describe('Scenarios - Delete', () => {
    test('Delete a scenario should be successful (happy case)', async () => {
      const scenario: Scenario = new Scenario();
      scenario.title = 'test scenario';
      await scenario.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/scenarios/${scenario.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await scenarioRepository.findOne(scenario.id)).toBeUndefined();
    });
  });

  describe('Scenarios - Get all', () => {
    test('Get all scenarios should be successful (happy case)', async () => {
      const scenario: Scenario = new Scenario();
      scenario.title = 'test scenario';
      await scenario.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(scenario.id);
    });
  });

  describe('Scenarios - Get by id', () => {
    test('Get a scenario by id should be successful (happy case)', async () => {
      const scenario: Scenario = new Scenario();
      scenario.title = 'test scenario';
      await scenario.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(scenario.id);
    });
  });
});
