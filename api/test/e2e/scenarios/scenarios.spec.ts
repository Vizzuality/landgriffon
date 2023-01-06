import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Scenario, SCENARIO_STATUS } from 'modules/scenarios/scenario.entity';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import {
  createAdminRegion,
  createBusinessUnit,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { JSONAPIEntityData } from 'utils/app-base.service';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';

const expectedJSONAPIAttributes: string[] = [
  'title',
  'description',
  'status',
  'metadata',
  'createdAt',
  'updatedAt',
];

describe('ScenariosModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let scenarioRepository: ScenarioRepository;
  let scenarioInterventionRepository: ScenarioInterventionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    scenarioRepository =
      moduleFixture.get<ScenarioRepository>(ScenarioRepository);
    scenarioInterventionRepository =
      moduleFixture.get<ScenarioInterventionRepository>(
        ScenarioInterventionRepository,
      );
    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );

    const tokenWithId = await saveUserAndGetTokenWithUserId(moduleFixture, app);
    jwtToken = tokenWithId.jwtToken;
    userId = tokenWithId.userId;
  });

  afterEach(async () => {
    await scenarioRepository.delete({});
    await sourcingRecordRepository.delete({});
    await scenarioInterventionRepository.delete({});
  });

  afterAll(async () => {
    await clearEntityTables(dataSource, [User]);
    await app.close();
  });

  describe('Scenarios - Create', () => {
    test('Create a scenario should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario',
        })
        .expect(HttpStatus.CREATED);

      const createdScenario: Scenario | null = await scenarioRepository.findOne(
        {
          where: { id: response.body.data.id },
        },
      );

      if (createdScenario === null) {
        throw new Error('Error loading created Scenario');
      }

      expect(createdScenario.title).toEqual('test scenario');
      expect(createdScenario.userId).toEqual(userId);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Create a scenario without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'title should not be empty',
          'title must be shorter than or equal to 40 characters',
          'title must be longer than or equal to 2 characters',
          'title must be a string',
        ],
      );
    });
  });

  describe('Scenarios - Update', () => {
    test('Update a scenario should be successful (happy case)', async () => {
      const scenario: Scenario = await createScenario();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenario.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'updated test scenario',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'updated test scenario',
      );
      const updatedScenario: Scenario = await scenarioRepository.findOneOrFail({
        where: { id: scenario.id },
      });
      expect(updatedScenario.updatedById).toEqual(userId);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });

  describe('Scenarios - Delete', () => {
    test('Delete a scenario should be successful (happy case)', async () => {
      const scenario: Scenario = await createScenario();

      await request(app.getHttpServer())
        .delete(`/api/v1/scenarios/${scenario.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await scenarioRepository.findOne({ where: { id: scenario.id } }),
      ).toBeNull();
    });
  });

  describe('Cascade delete os Scenario', () => {
    test('When Scenario is deleted, related interventions must be deleted as well', async () => {
      const scenario: Scenario = await createScenario();
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention({ scenario });

      const sourcingLocation: SourcingLocation = await createSourcingLocation({
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      });

      await createSourcingRecord({ sourcingLocationId: sourcingLocation.id });

      const interventions: ScenarioIntervention[] =
        await scenarioInterventionRepository.find();
      const sourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find();
      const sourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find();

      expect(interventions.length).toBe(1);
      expect(sourcingLocations.length).toBe(1);
      expect(sourcingRecords.length).toBe(1);

      await scenarioRepository.delete(scenario.id);

      const interventionsAfterDelete: ScenarioIntervention[] =
        await scenarioInterventionRepository.find();
      const sourcingLocationsAfterDelete: SourcingLocation[] =
        await sourcingLocationRepository.find();
      const sourcingRecordsAfterDelete: SourcingRecord[] =
        await sourcingRecordRepository.find();

      expect(interventionsAfterDelete.length).toBe(0);
      expect(sourcingLocationsAfterDelete.length).toBe(0);
      expect(sourcingRecordsAfterDelete.length).toBe(0);
    });
  });

  describe('Scenarios - Get all', () => {
    test('Get all scenarios should be successful (happy case)', async () => {
      const scenario: Scenario = await createScenario();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(scenario.id);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('When I filter scenarios by hasActiveInterventions, I should only get scenarios with at least one active intervention', async () => {
      const scenarioOne: Scenario = await createScenario({
        title: 'scenario one',
        status: SCENARIO_STATUS.ACTIVE,
        description: 'ignored',
      });
      await createScenarioIntervention({
        scenario: scenarioOne,
        title: 'intervention 1-1',
        status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
      });

      const scenarioTwo: Scenario = await createScenario({
        title: 'scenario two',
        status: SCENARIO_STATUS.ACTIVE,
        description: 'ignored 2',
      });

      await createScenarioIntervention({
        scenario: scenarioTwo,
        title: 'intervention 2-1',
        status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
      });

      await createScenarioIntervention({
        scenario: scenarioTwo,
        title: 'intervention 2-2',
        status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
      });

      const scenarioThree: Scenario = await createScenario({
        title: 'scenario three',
        status: SCENARIO_STATUS.ACTIVE,
        description: 'selected',
      });
      await createScenarioIntervention({
        scenario: scenarioThree,
        title: 'intervention 2-1',
        status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
      });
      await createScenarioIntervention({
        scenario: scenarioThree,
        title: 'intervention 2-2',
        status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
      });

      const scenarioFour: Scenario = await createScenario({
        title: 'scenario four',
        status: SCENARIO_STATUS.ACTIVE,
        description: 'selected 2',
      });

      await createScenarioIntervention({
        scenario: scenarioFour,
        title: 'intervention 4-1',
        status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
      });
      await createScenarioIntervention({
        scenario: scenarioFour,
        title: 'intervention 4-2',
        status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          hasActiveInterventions: true,
        })
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toEqual(2);
      expect(
        response.body.data.some(
          (scenario: JSONAPIEntityData) =>
            scenario.attributes.title === scenarioThree.title,
        ),
      ).toBeTruthy();
      expect(
        response.body.data.some(
          (scenario: JSONAPIEntityData) =>
            scenario.attributes.title === scenarioFour.title,
        ),
      ).toBeTruthy();

      expect(
        response.body.data.some(
          (scenario: JSONAPIEntityData) =>
            scenario.attributes.title === scenarioOne.title,
        ),
      ).toBeFalsy();
      expect(
        response.body.data.some(
          (scenario: JSONAPIEntityData) =>
            scenario.attributes.title === scenarioTwo.title,
        ),
      ).toBeFalsy();

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('When I search for scenarios via title partial matching, I get correct results', async () => {
      //ARRANGE
      const scenarioOne: Scenario = await createScenario({
        title: 'Scenario Jedi Training',
        status: SCENARIO_STATUS.ACTIVE,
      });
      const scenarioTwo: Scenario = await createScenario({
        title: 'Scenario Jedi Deployment',
        status: SCENARIO_STATUS.ACTIVE,
      });

      await createScenario({
        title: 'Scenario Order 66',
        status: SCENARIO_STATUS.ACTIVE,
      });

      //ACT
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          search: {
            title: 'JEDI',
          },
        })
        .send()
        .expect(HttpStatus.OK);

      //ASSERT
      expect(response.body.data.length).toEqual(2);
      expect(response.body.data[0].attributes.title).toEqual(scenarioOne.title);
      expect(response.body.data[1].attributes.title).toEqual(scenarioTwo.title);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Get scenarios filtered by some criteria should only return the scenarios that match said criteria', async () => {
      const scenarioOne: Scenario = await createScenario({
        title: 'scenario one',
        status: SCENARIO_STATUS.ACTIVE,
      });
      const scenarioTwo: Scenario = await createScenario({
        title: 'scenario two',
        status: SCENARIO_STATUS.ACTIVE,
      });
      await createScenario({
        title: 'scenario three',
        status: SCENARIO_STATUS.DELETED,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          filter: {
            status: SCENARIO_STATUS.ACTIVE,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e: any) => e.id)).toEqual([
        scenarioOne.id,
        scenarioTwo.id,
      ]);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Get scenarios in pages should return a partial list of scenarios', async () => {
      await Promise.all(
        Array.from(Array(10).keys()).map(() => createScenario()),
      );

      const responseOne = await request(app.getHttpServer())
        .get(`/api/v1/scenarios`)
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
        .get(`/api/v1/scenarios`)
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
  });

  describe('Scenarios - Get by id', () => {
    test('Get a scenario by id should be successful (happy case)', async () => {
      const scenario: Scenario = await createScenario();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(scenario.id);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
    test(
      'When I filter Interventions by Scenario Id + ' +
        'Then I should receive said Interventions in the response' +
        'And they should include the replaced entity information',
      async () => {
        const replacedMaterial = await createMaterial({
          name: ' replaced material',
        });

        const replacedBusinessUnit = await createBusinessUnit({
          name: ' replaced business unit',
        });

        const replacedAdminRegion = await createAdminRegion({
          name: ' replaced admin region',
        });

        const newMaterial = await createMaterial({
          name: ' new material',
        });

        const newBusinessUnit = await createBusinessUnit({
          name: ' new business unit',
        });

        const newAdminRegion = await createAdminRegion({
          name: ' new admin region',
        });

        const scenarioIntervention = await createScenarioIntervention({
          replacedMaterials: [replacedMaterial],
          replacedBusinessUnits: [replacedBusinessUnit],
          replacedAdminRegions: [replacedAdminRegion],
          newMaterial,
          newBusinessUnit,
          newAdminRegion,
          startYear: 2020,
        });

        const scenario = await createScenario({
          scenarioInterventions: [scenarioIntervention],
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v1/scenarios/${scenario.id}/interventions`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send();

        expect(
          response.body.data[0].attributes.replacedMaterials[0].id,
        ).toEqual(replacedMaterial.id);
        expect(
          response.body.data[0].attributes.replacedAdminRegions[0].id,
        ).toEqual(replacedAdminRegion.id);
        expect(
          response.body.data[0].attributes.replacedBusinessUnits[0].id,
        ).toEqual(replacedBusinessUnit.id);
        expect(response.body.data[0].attributes.newMaterial.id).toEqual(
          newMaterial.id,
        );
        expect(response.body.data[0].attributes.newBusinessUnit.id).toEqual(
          newBusinessUnit.id,
        );
        expect(response.body.data[0].attributes.newAdminRegion.id).toEqual(
          newAdminRegion.id,
        );
        expect(response.body.data[0].attributes.startYear).toEqual(2020);
      },
    );
  });
  test(
    'When I filter Interventions by Scenario Id + ' +
      'Then I should receive said Interventions in the response' +
      'And they should be ordered by creation date in a DESC order',
    async () => {
      const interventions: ScenarioIntervention[] = [];

      const scenario: Scenario = await createScenario();

      for (const n of [1, 2, 3, 4, 5]) {
        const intervention = await createScenarioIntervention({
          scenario,
          title: `inter ${n}`,
        });
        interventions.push(intervention);
      }
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.id}/interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(
        interventions.map((i: ScenarioIntervention) => i.id).reverse(),
      ).toEqual(response.body.data.map((i: ScenarioIntervention) => i.id));
    },
  );
});
