import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { setupTestUser } from '../../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { Indicator } from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import { createChartLevelsPreconditions } from '../mocks/chart-levels-preconditions/nested-origins.preconditions';
import { AdminRegion } from '../../../../src/modules/admin-regions/admin-region.entity';

describe('Impact Chart (Ranking) Test Suite (e2e) with requested levels for Admin Regions', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;
  let preconditions: {
    indicator: Indicator;
    country: AdminRegion;
    provinces: AdminRegion[];
    municipalities: AdminRegion[];
  };

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));

    preconditions = await createChartLevelsPreconditions();
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
          'indicatorIds[]': [preconditions.indicator.id],
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
      'And request data for admin regions of depth 1' +
      'Then I should get response structure in accordance with requested level (province)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
          depth: 1,
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
      'And request data for admin regions of depth 2' +
      'Then I should get response structure in accordance with requested level (municipality)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
          depth: 2,
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

  test(
    'When I query a Impact Chart grouped by region ' +
      'And send no depth param, but filter by origins of level 0 ' +
      'Then I should get response structure starting with regions of level 1 (provinces)',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'originIds[]': [preconditions.country.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
          maxRankingEntities: 5,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(3);
      expect(response.body.impactTable[0].rows[0].name).toBe('Province 3');
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(3000);
      expect(
        response.body.impactTable[0].others.aggregatedValues[0].value,
      ).toBe(0);
    },
  );

  test(
    'When I query a Impact Chart grouped by region ' +
      'And send no depth param, but filter by origins of level 1 ' +
      'Then I should get response structure starting with regions of level 2 (municipalities)',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'originIds[]': [
            preconditions.provinces[0].id,
            preconditions.provinces[1].id,
            preconditions.provinces[2].id,
          ],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
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

  test(
    'When I query a Impact Chart grouped by region ' +
      'And send no depth param, but filter by origins of level 0 and 1 ' +
      'Then I should get response structure starting with regions of level 2 (going one level down from the lowest received)',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'originIds[]': [
            preconditions.provinces[0].id,
            preconditions.provinces[2].id,
            preconditions.country.id,
          ],
          endYear: 2020,
          startYear: 2020,
          groupBy: 'region',
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
