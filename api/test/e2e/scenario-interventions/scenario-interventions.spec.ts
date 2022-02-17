import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { ScenarioInterventionsModule } from 'modules/scenario-interventions/scenario-interventions.module';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import {
  createBusinessUnit,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';

const expectedJSONAPIAttributes: string[] = [
  'title',
  'type',
  'description',
  'status',
  'createdAt',
  'updatedAt',
];

describe('ScenarioInterventionsModule (e2e)', () => {
  let app: INestApplication;
  let scenarioInterventionRepository: ScenarioInterventionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ScenarioInterventionsModule],
    }).compile();

    scenarioInterventionRepository =
      moduleFixture.get<ScenarioInterventionRepository>(
        ScenarioInterventionRepository,
      );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await scenarioInterventionRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario interventions - Create', () => {
    test('Create a scenario intervention should be successful (happy case)', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.CREATED);

      const createdScenarioIntervention =
        await scenarioInterventionRepository.findOne(response.body.data.id);

      if (!createdScenarioIntervention) {
        throw new Error('Error loading created Scenario intervention');
      }

      expect(createdScenarioIntervention.title).toEqual(
        'test scenario intervention',
      );

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });

  describe('Missing data and validations', () => {
    test('Create a scenario intervention without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'title must be shorter than or equal to 40 characters',
          'title must be longer than or equal to 2 characters',
          'title should not be empty',
          'title must be a string',
          'type must be a valid enum value',
          'type should not be empty',
          'type must be a string',
          'startYear should not be empty',
          'startYear must be a number conforming to the specified constraints',
          'percentage should not be empty',
          'percentage must be a number conforming to the specified constraints',
          'scenarioId should not be empty',
          'scenarioId must be a UUID',
          'materialsIds should not be empty',
          'each value in materialsIds must be a UUID',
          'businessUnitsIds should not be empty',
          'each value in businessUnitsIds must be a UUID',
          'suppliersIds should not be empty',
          'each value in suppliersIds must be a UUID',
          'newIndicatorCoefficients must be a json string',
          'newIndicatorCoefficients should not be empty',
          'newIndicatorCoefficients must be a string',
        ],
      );
    });

    test('Create new intervention with replacing supplier without new location data fields should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available columns for new location type: production unit, processing facility, tier 1 Trade facility, tier 2 Trade facility, origin Country, unknown, aggregation point, point of production, country of production',
          'New location type input is required for the selected intervention type',
        ],
      );
    });

    test('Create new intervention with replacing material without new location data fields and new material should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available columns for new location type: production unit, processing facility, tier 1 Trade facility, tier 2 Trade facility, origin Country, unknown, aggregation point, point of production, country of production',
          'New location type input is required for the selected intervention type',
          'newMaterialId must be a UUID',
          'New Material is required for the selected intervention type',
        ],
      );
    });
  });

  describe('Scenario interventions - Update', () => {
    test('Update a scenario intervention should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'updated test scenario intervention',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'updated test scenario intervention',
      );

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });

  describe('Scenario interventions - Delete', () => {
    test('Delete a scenario intervention should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      await request(app.getHttpServer())
        .delete(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await scenarioInterventionRepository.findOne(scenarioIntervention.id),
      ).toBeUndefined();
    });
  });

  describe('Scenario interventions - Get all', () => {
    test('Get all scenario interventions should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(scenarioIntervention.id);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Get scenario interventions in pages should return a partial list of scenario interventions', async () => {
      await Promise.all(
        Array.from(Array(10).keys()).map(() => createScenarioIntervention()),
      );

      const responseOne = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          page: {
            size: 3,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(responseOne.body.data).toHaveLength(3);
      expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);

      const responseTwo = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          page: {
            size: 3,
            number: 4,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(responseTwo.body.data).toHaveLength(1);
      expect(responseTwo).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Get scenario interventions filtered by some criteria should only return the scenario interventions that match said criteria', async () => {
      const scenarioInterventionOne: ScenarioIntervention =
        await createScenarioIntervention({
          title: 'scenario intervention one',
          status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
        });
      const scenarioInterventionTwo: ScenarioIntervention =
        await createScenarioIntervention({
          title: 'scenario intervention two',
          status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
        });
      await createScenarioIntervention({
        title: 'scenario intervention three',
        status: SCENARIO_INTERVENTION_STATUS.DELETED,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          filter: {
            status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e: any) => e.id)).toEqual([
        scenarioInterventionOne.id,
        scenarioInterventionTwo.id,
      ]);
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });

  describe('Scenario interventions - Get by id', () => {
    test('Get a scenario intervention by id should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(scenarioIntervention.id);
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });
});
