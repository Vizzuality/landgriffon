import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { setupTestUser } from '../../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { Indicator } from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import { createChartLevelsPreconditions } from '../mocks/chart-levels-preconditions/chart-levels.preconditions';

describe('Impact Chart (Ranking) Test Suite (e2e) with requested levels', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;
  let indicator: Indicator;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));

    indicator = await createChartLevelsPreconditions();
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test(
    'When I query a Impact Chart grouped by region ' +
      'And  do not specify level' +
      'Then I should get response structure starting from the highest level (country)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(1);
      expect(response.body.impactTable[0].rows[0].name).toBe('Country');
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(7000);
    },
  );

  test(
    'When I query a Impact Chart grouped by region ' +
      'And request data for admin regions of level 2' +
      'Then I should get response structure in accordance with requested level (province)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
          level: 2,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(3);
      expect(response.body.impactTable[0].rows[0].name).toBe('Province 3');
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(3000);
    },
  );

  test(
    'When I query a Impact Chart grouped by region ' +
      'And request data for admin regions of level 3' +
      'Then I should get response structure in accordance with requested level (municipality)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
          level: 3,
          maxRankingEntities: 5,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(5);
      expect(response.body.impactTable[0].rows[0].name).toBe('Municipality 1');
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(1000);
      expect(
        response.body.impactTable[0].others.aggregatedValues[0].value,
      ).toBe(2000);
    },
  );
});
