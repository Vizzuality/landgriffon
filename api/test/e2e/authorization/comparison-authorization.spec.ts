import * as request from 'supertest';
import { User } from 'modules/users/user.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { createScenario } from '../../entity-mocks';
import { Indicator } from 'modules/indicators/indicator.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { DataSource } from 'typeorm';
import { setupTestUser } from '../../utils/userAuth';
import { HttpStatus } from '@nestjs/common';
import { v4 } from 'uuid';
import { H3MapResponse } from '../../../src/modules/h3-data/dto/h3-map-response.dto';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { IndicatorsService } from '../../../src/modules/indicators/indicators.service';
import { MaterialsService } from '../../../src/modules/materials/materials.service';
import { H3DataMapService } from '../../../src/modules/h3-data/h3-data-map.service';
import { Scenario } from '../../../src/modules/scenarios/scenario.entity';

describe('Authorization Test (E2E)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init(
      Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(IndicatorsService)
        .useValue({
          areRequestedIndicatorsActive: async () => true,
        })
        .overrideProvider(MaterialsService)
        .useValue({ areRequestedMaterialsActive: async () => true })
        .overrideProvider(H3DataMapService)
        .useValue({
          getImpactMapByResolution: async (dto: any) => ({} as H3MapResponse),
        }),
    );

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
  describe('Comparison Mode Authorization tests', () => {
    describe('Impact Map Comparisons', () => {
      test('When I request a comparison map between actual data and scenario, But that scenario is neither mine or public, Then I should not be authorised', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        const comparedScenario = await createScenario({ isPublic: false });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });

      test('When I request a comparison map between actual data and scenario, And that scenario is neither mine or public, But I am an Admin, Then I should get the data', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.ADMIN);
        const { user: someFakeUser } = await setupTestUser(
          testApplication,
          ROLES.USER,
          { email: 'somefakuser@test.com' },
        );
        const comparedScenario = await createScenario({
          isPublic: false,
          userId: someFakeUser.id,
        });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });

      test('When I request a comparison map between actual data and scenario, But that scenario is mine, Then I should be authorised', async () => {
        const { jwtToken, user } = await setupTestUser(
          testApplication,
          ROLES.USER,
        );
        const comparedScenario = await createScenario({
          isPublic: false,
          userId: user.id,
        });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
      test('When I request a comparison map between two scenarios, And none of them is mine, Then I should not be authorised', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        const comparedScenario = await createScenario({
          isPublic: false,
        });
        const baseScenario = await createScenario({ isPublic: false });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            baseScenarioId: baseScenario.id,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
      test('When I request a comparison map between two scenarios, And one is public but the other one is not either public or mine, Then I should not be authorised', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        const comparedScenario = await createScenario({
          isPublic: true,
        });
        const baseScenario = await createScenario({ isPublic: false });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            baseScenarioId: baseScenario.id,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });

      test('When I request a comparison map between two scenarios, And both of them are public, Then I should get the data', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.USER);
        const comparedScenario = await createScenario({
          isPublic: true,
        });
        const baseScenario = await createScenario({ isPublic: true });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            baseScenarioId: baseScenario.id,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
      test('When I request a comparison map between two scenarios, And both are mine, Then I should be authorised', async () => {
        const { jwtToken, user } = await setupTestUser(
          testApplication,
          ROLES.USER,
        );
        const comparedScenario = await createScenario({
          isPublic: false,
          userId: user.id,
        });
        const baseScenario = await createScenario({
          isPublic: false,
          userId: user.id,
        });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            baseScenarioId: baseScenario.id,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });

      test('When I request a comparison map between two scenarios, And any of them is public or mine, But I am an admin, Then I should get the data', async () => {
        const { jwtToken } = await setupTestUser(testApplication, ROLES.ADMIN);
        const { user: someFakeUser } = await setupTestUser(
          testApplication,
          ROLES.USER,
          { email: 'test@test.com' },
        );
        const comparedScenario = await createScenario({
          isPublic: false,
          userId: someFakeUser.id,
        });
        const baseScenario = await createScenario({
          isPublic: false,
          userId: someFakeUser.id,
        });

        await request(testApplication.getHttpServer())
          .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
          .query({
            indicatorId: v4(),
            year: 2023,
            resolution: 4,
            baseScenarioId: baseScenario.id,
            comparedScenarioId: comparedScenario.id,
            relative: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
    });
  });
});
