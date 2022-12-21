import { Test, TestingModule } from '@nestjs/testing';

import { ScenarioInterventionsModule } from '../../../../src/modules/scenario-interventions/scenario-interventions.module';
import { getApp } from '../../../utils/getApp';
import { saveUserWithRoleAndGetTokenWithUserId } from '../../../utils/userAuth';
import { INestApplication } from '@nestjs/common';
import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES_NEW,
} from '../../../../src/modules/indicators/indicator.entity';
import { AppModule } from '../../../../src/app.module';
import {
  createIndicator,
  createScenarioIntervention,
} from '../../../entity-mocks';
import { clearEntityTables } from '../../../utils/database-test-helper';
import * as request from 'supertest';
import { SCENARIO_INTERVENTION_TYPE } from '../../../../src/modules/scenario-interventions/scenario-intervention.entity';
import { v4 as uuidv4 } from 'uuid';
import { IndicatorsModule } from '../../../../src/modules/indicators/indicators.module';
import { getConnection } from 'typeorm';
import { ScenarioInterventionsService } from '../../../../src/modules/scenario-interventions/scenario-interventions.service';

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    switch (key) {
      case 'newMethodology':
        return true;
      default:
        return configGet.call(config, key);
    }
  };
  return config;
});

describe('Interventions E2E Tests (Controller Validations)', () => {
  let jwtToken: string;
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorsModule, ScenarioInterventionsModule],
    })
      .overrideProvider(ScenarioInterventionsService)
      .useValue({
        createScenarioIntervention: () => true,
        serialize: () => ({
          mockResponse: true,
        }),
        updateIntervention: () => true,
      })
      .compile();

    app = getApp(moduleFixture);
    await app.init();
    const tokenWithId = await saveUserWithRoleAndGetTokenWithUserId(
      moduleFixture,
      app,
    );
    jwtToken = tokenWithId.jwtToken;
  });

  afterEach(() => {
    return clearEntityTables([Indicator]);
  });

  afterAll(() => {
    return app.close();
  });

  test(
    'When I send some coefficients to be used to calculate impact' +
      'But these differs from the ones that are active in the DB' +
      'Then I should get and error message',
    async () => {
      for (const [index, data] of Object.entries(
        INDICATOR_TYPES_NEW,
      ).entries()) {
        if (index % 2 === 0) {
          await createIndicator({
            name: `indicator n ${index}`,
            nameCode: data[1],
            status: INDICATOR_STATUS.ACTIVE,
          });
        } else {
          await createIndicator({
            name: `indicator n ${index}`,
            nameCode: data[1],
            status: INDICATOR_STATUS.INACTIVE,
          });
        }
      }

      const indicatorRepository = getConnection().getRepository(Indicator);

      const activeIndicators: string[] = (
        await indicatorRepository.find({
          status: INDICATOR_STATUS.ACTIVE,
        })
      ).map((i: Indicator) => i.nameCode);

      const inactiveIndicators: string[] = (
        await indicatorRepository.find({
          status: INDICATOR_STATUS.INACTIVE,
        })
      ).map((i: Indicator) => i.nameCode);

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: 1,
          },
        });

      expect(
        response.body.errors[0].meta.rawError.response.message[0],
      ).toContain(activeIndicators.join(', '));
      expect(
        response.body.errors[0].meta.rawError.response.message[0],
      ).not.toContain(inactiveIndicators.join(', '));
    },
  );

  test(
    'When I send some coefficients to be used to calculate impact' +
      'And I match the ones that are active' +
      'Then the validation should pass',
    async () => {
      await createIndicator({
        nameCode: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
        name: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
      });
      await createIndicator({
        nameCode: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
        name: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: 1,
            [INDICATOR_TYPES_NEW.DEFORESTATION_RISK]: 2,
          },
        });

      expect(response.body.errors).toBeUndefined();
    },
  );

  test(
    'When I edit some coefficients of a intervention to calculate new impact with' +
      'And I match the ones that are active' +
      'Then the validation should pass',
    async () => {
      const intervention = await createScenarioIntervention();
      await createIndicator({
        nameCode: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
        name: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
      });
      await createIndicator({
        nameCode: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
        name: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${intervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: 1,
            [INDICATOR_TYPES_NEW.DEFORESTATION_RISK]: 2,
          },
        });

      expect(response.body.errors).toBeUndefined();
    },
  );
  test(
    'When I edit some coefficients of a intervention to calculate new impact with' +
      'And I match the ones that are active' +
      'Then the validation should pass',
    async () => {
      const intervention = await createScenarioIntervention();
      await createIndicator({
        nameCode: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
        name: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
      });
      await createIndicator({
        nameCode: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
        name: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${intervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: 1,
            [INDICATOR_TYPES_NEW.DEFORESTATION_RISK]: 2,
          },
        });

      expect(response.body.errors).toBeUndefined();
    },
  );

  test(
    'When I edit some coefficients to calculate new impact for that intervention' +
      'But these differs from the ones that are active in the DB' +
      'Then I should get and error message',
    async () => {
      const intervention = await createScenarioIntervention();

      for (const [index, data] of Object.entries(
        INDICATOR_TYPES_NEW,
      ).entries()) {
        if (index % 2 === 0) {
          await createIndicator({
            name: `indicator n ${index}`,
            nameCode: data[1],
            status: INDICATOR_STATUS.ACTIVE,
          });
        } else {
          await createIndicator({
            name: `indicator n ${index}`,
            nameCode: data[1],
            status: INDICATOR_STATUS.INACTIVE,
          });
        }
      }

      const indicatorRepository = getConnection().getRepository(Indicator);

      const activeIndicators: string[] = (
        await indicatorRepository.find({
          status: INDICATOR_STATUS.ACTIVE,
        })
      ).map((i: Indicator) => i.nameCode);

      const inactiveIndicators: string[] = (
        await indicatorRepository.find({
          status: INDICATOR_STATUS.INACTIVE,
        })
      ).map((i: Indicator) => i.nameCode);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${intervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: 1,
          },
        });

      expect(
        response.body.errors[0].meta.rawError.response.message[0],
      ).toContain(activeIndicators.join(', '));
      expect(
        response.body.errors[0].meta.rawError.response.message[0],
      ).not.toContain(inactiveIndicators.join(', '));
    },
  );
});
