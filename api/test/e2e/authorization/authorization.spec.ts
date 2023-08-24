import * as request from 'supertest';
import { User } from 'modules/users/user.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import {
  createIndicator,
  createMaterial,
  createSourcingLocation,
} from '../../entity-mocks';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { DataSource } from 'typeorm';
import { setupTestUser } from '../../utils/userAuth';
import { HttpStatus } from '@nestjs/common';
import { Scenario } from '../../../src/modules/scenarios/scenario.entity';

describe('Authorization Test (E2E)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
      Scenario,
      User,
      Indicator,
      SourcingLocation,
    ]);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Authorization Tests (e2e)', () => {
    describe('XLSXL Import', () => {
      test('When I try to import a file, But I have no Admin role, Then I should get an error message', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);

        await request(testApplication.getHttpServer())
          .post(`/api/v1/import/sourcing-data`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
      test('When I try to import a file, And I have no Admin role, Then I should not get Bad Request exception, But my request should be authorised', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.ADMIN);

        const response = await request(testApplication.getHttpServer())
          .post(`/api/v1/import/sourcing-data`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.errors[0].title).toEqual(
          'A .XLSX file must be provided as payload',
        );
      });
    });
    describe('Indicators', () => {
      test('When I want to list indicators, And I have no Admin roles, I should be allowed', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        await request(testApplication.getHttpServer())
          .get(`/api/v1/indicators/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        const indicator = await createIndicator({
          nameCode: INDICATOR_TYPES.DEFORESTATION_RISK,
        });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/indicators/${indicator.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
      test('When I want to create, update or delete a Indicator, And I have no Admin roles, Then I should get a error response', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        await request(testApplication.getHttpServer())
          .post(`/api/v1/indicators/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        const indicator = await createIndicator({
          nameCode: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        });

        await request(testApplication.getHttpServer())
          .delete(`/api/v1/indicators/${indicator.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        await request(testApplication.getHttpServer())
          .patch(`/api/v1/indicators/${indicator.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
    });
    describe('Sourcing Locations', () => {
      test('When I want to list sourcing locations, And I have no Admin roles, I should be allowed', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        await request(testApplication.getHttpServer())
          .get(`/api/v1/sourcing-locations/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        const sourcingLocation = await createSourcingLocation({});

        await request(testApplication.getHttpServer())
          .get(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
      test('When I want to create, update or delete a Sourcing Location, And I have no Admin roles, Then I should get a error response', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        await request(testApplication.getHttpServer())
          .post(`/api/v1/sourcing-locations/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        const sourcingLocation = await createSourcingLocation({});

        await request(testApplication.getHttpServer())
          .delete(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        await request(testApplication.getHttpServer())
          .patch(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
    });
    describe('Materials', () => {
      test('When I want to list of Materials, But I have no Admin roles, I should be allowed', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        await request(testApplication.getHttpServer())
          .get(`/api/v1/materials/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        await request(testApplication.getHttpServer())
          .get(`/api/v1/materials/trees`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        const material = await createMaterial({});

        await request(testApplication.getHttpServer())
          .get(`/api/v1/materials/${material.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
      test('When I want to create, update or delete a Material, And I have no Admin roles, Then I should get a error response', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        await request(testApplication.getHttpServer())
          .post(`/api/v1/materials/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        const material = await createMaterial({});

        await request(testApplication.getHttpServer())
          .delete(`/api/v1/materials/${material.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        await request(testApplication.getHttpServer())
          .patch(`/api/v1/materials/${material.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });
});
