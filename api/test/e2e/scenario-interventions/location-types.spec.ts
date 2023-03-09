import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';

import * as request from 'supertest';
import { INTERVENTION_TYPE } from 'modules/interventions/intervention.entity';
import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { LOCATION_TYPES } from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { setupTestUser } from '../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { createIndicator } from '../../entity-mocks';
import { HttpStatus } from '@nestjs/common';
import { GeoCodingAbstractClass } from '../../../src/modules/geo-coding/geo-coding-abstract-class';
import { InterventionRepository } from '../../../src/modules/interventions/intervention.repository';
import { createInterventionPreconditions } from '../../utils/scenario-interventions-preconditions';

describe('Interventions E2E Tests (Location Types)', () => {
  let jwtToken: string;
  let testApplication: TestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init(
      Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(GeoCodingAbstractClass)
        .useValue({
          geoCodeSourcingLocation: () => ({
            adminRegionId: uuidv4(),
            geoRegionId: uuidv4(),
          }),
        })
        .overrideProvider(InterventionRepository)
        .useValue({
          saveNewIntervention: () => ({
            identifiers: [uuidv4()],
            title: 'FakeIntervention',
            updatedById: uuidv4(),
          }),
        }),
    );

    dataSource = testApplication.get<DataSource>(DataSource);

    const tokenWithId = await setupTestUser(testApplication);
    jwtToken = tokenWithId.jwtToken;
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });
  describe('Admin Region of Production', () => {
    test(
      'When I want to create a Intervention with Admin Region of Production Location type' +
        'But I dont provide a admin regions AND/OR a country' +
        'Then I should get an error',
      async () => {
        await createIndicator({
          name: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
          nameCode: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
          status: INDICATOR_STATUS.ACTIVE,
        });
        const response = await request(testApplication.getHttpServer())
          .post(`/api/v1/scenario-interventions`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'test scenario intervention',
            startYear: 2018,
            percentage: 50,
            scenarioId: uuidv4(),
            newMaterialId: uuidv4(),
            materialIds: [uuidv4()],
            supplierIds: [uuidv4()],
            businessUnitIds: [uuidv4()],
            adminRegionIds: [uuidv4()],
            newLocationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
            type: INTERVENTION_TYPE.NEW_MATERIAL,
            newIndicatorCoefficients: {
              [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: 1,
            },
          });

        expect(response).toHaveErrorMessage(
          HttpStatus.BAD_REQUEST,
          'Bad Request Exception',
          [
            'New Location Country input is required for the selected intervention and location type',
            'New Administrative Region input is required for the selected intervention and location type',
          ],
        );
        // Deleting manually so the next tests tear down does not clash with all the precondition hell
        await dataSource.getRepository(Indicator).delete({});
      },
    );

    test(
      'When I want to create a Intervention with Admin Region of Production Location type' +
        'And I provide correct Location Info' +
        'Then I should be able to create the intervention',
      async () => {
        const preconditions = await createInterventionPreconditions(dataSource);

        const response = await request(testApplication.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'test admin are of production',
            startYear: 2018,
            percentage: 50,
            scenarioId: preconditions.scenario.id,
            materialIds: [preconditions.material1.id],
            supplierIds: [preconditions.supplier1.id],
            businessUnitIds: [preconditions.businessUnit1.id],
            adminRegionIds: [preconditions.adminRegion1.id],
            newLocationCountryInput: 'TestCountry',
            newLocationAdminRegionInput:
              'I dont care since Im mocking the geocoding',
            type: INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
            // TODO generate from enum
            newIndicatorCoefficients: {
              UWU_T: 5,
              UWUSR_T: 5,
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              LI: 3,
            },
          });

        expect(response.body.data).toEqual({
          type: 'scenarioInterventions',
          attributes: { title: 'test admin are of production' },
        });
      },
    );
  });
});
