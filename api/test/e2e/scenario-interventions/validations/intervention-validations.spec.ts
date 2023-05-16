import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES_NEW,
} from 'modules/indicators/indicator.entity';
import {
  createIndicator,
  createMaterial,
  createScenarioIntervention,
  createSupplier,
} from '../../../entity-mocks';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../../utils/database-test-helper';
import * as request from 'supertest';
import { SCENARIO_INTERVENTION_TYPE } from 'modules/scenario-interventions/scenario-intervention.entity';
import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { setupTestUser } from '../../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { Test } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';
import {
  Material,
  MATERIALS_STATUS,
} from '../../../../src/modules/materials/material.entity';
import { HttpStatus } from '@nestjs/common';
import { Supplier } from 'modules/suppliers/supplier.entity';

describe('Interventions E2E Tests (Controller Validations)', () => {
  let jwtToken: string;
  let testApplication: TestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init(
      Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ScenarioInterventionsService)
        .useValue({
          createScenarioIntervention: () => true,
          serialize: () => ({
            mockResponse: true,
          }),
          updateIntervention: () => true,
        }),
    );

    dataSource = testApplication.get<DataSource>(DataSource);

    const tokenWithId = await setupTestUser(testApplication);
    jwtToken = tokenWithId.jwtToken;
  });

  afterEach(() => {
    return clearEntityTables(dataSource, [Indicator]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
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

      const indicatorRepository = dataSource.getRepository(Indicator);

      const activeIndicators: string[] = (
        await indicatorRepository.find({
          where: {
            status: INDICATOR_STATUS.ACTIVE,
          },
        })
      ).map((i: Indicator) => i.nameCode);

      const inactiveIndicators: string[] = (
        await indicatorRepository.find({
          where: {
            status: INDICATOR_STATUS.INACTIVE,
          },
        })
      ).map((i: Indicator) => i.nameCode);

      const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
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

      const indicatorRepository = dataSource.getRepository(Indicator);

      const activeIndicators: string[] = (
        await indicatorRepository.find({
          where: {
            status: INDICATOR_STATUS.ACTIVE,
          },
        })
      ).map((i: Indicator) => i.nameCode);

      const inactiveIndicators: string[] = (
        await indicatorRepository.find({
          where: {
            status: INDICATOR_STATUS.INACTIVE,
          },
        })
      ).map((i: Indicator) => i.nameCode);

      const response = await request(testApplication.getHttpServer())
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

  test(
    'When I Create new intervention with replacing material ' +
      +'And the replacing material is active ' +
      +'Then validation shall pass',

    async () => {
      const material: Material = await createMaterial();
      const unkNownT1Supplier: Supplier = await createSupplier({
        name: 'unknownT1',
      });
      const unknownProducer: Supplier = await createSupplier({
        name: 'unknownProducer',
      });
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newLocationCountryInput: 'TestCountry',
          newLocationType: 'unknown',
          newMaterialId: material.id,
          newT1SupplierId: unkNownT1Supplier.id,
          newProducerId: unknownProducer.id,
        });

      expect(response.body.errors).toBeUndefined();
    },
  );

  test(
    'When I Create new intervention with replacing material ' +
      +'But the replacing material is Inactive ' +
      +'Then I should get a relevant error message',
    async () => {
      const material: Material = await createMaterial({
        name: 'Inactive Material',
        status: MATERIALS_STATUS.INACTIVE,
      });
      const unkNownT1Supplier: Supplier = await createSupplier({
        name: 'unknownT1',
      });
      const unknownProducer: Supplier = await createSupplier({
        name: 'unknownProducer',
      });
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: uuidv4(),
          materialIds: [uuidv4()],
          supplierIds: [uuidv4()],
          businessUnitIds: [uuidv4()],
          adminRegionIds: [uuidv4()],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newLocationCountryInput: 'TestCountry',
          newLocationType: 'unknown',
          newMaterialId: material.id,
          newT1SupplierId: unkNownT1Supplier.id,
          newProducerId: unknownProducer.id,
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.errors[0].title).toEqual(
        'Following Requested Materials are not activated: Inactive Material',
      );
    },
  );
});
