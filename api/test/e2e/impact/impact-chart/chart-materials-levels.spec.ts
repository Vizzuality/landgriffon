import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { setupTestUser } from '../../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { Indicator } from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import { Material } from '../../../../src/modules/materials/material.entity';
import { createNestedMaterialsPreconditions } from '../mocks/chart-levels-preconditions/nested-materials.preconditions';
import { GROUP_BY_VALUES } from '../../../../src/modules/h3-data/dto/get-impact-map.dto';

describe('Impact Chart (Ranking) Test Suite (e2e) with requested levels for Materials', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;
  let preconditions: {
    indicator: Indicator;
    rootMaterial: Material;
    materialsLevelOne: Material[];
    materialsLevelTwo: Material[];
  };

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));

    preconditions = await createNestedMaterialsPreconditions();
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test(
    'When I query a Impact Chart grouped by material without any material filter ' +
      'And  do not specify level' +
      'Then I should get response structure starting from the root level materials  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(1);
      expect(response.body.impactTable[0].rows[0].name).toBe('Root Material');
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(5000);
    },
  );

  test(
    'When I query a Impact Chart grouped by material and filtered by root material ' +
      'And  do not specify level' +
      'Then I should get response structure starting from the level one materials  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'materialIds[]': [preconditions.rootMaterial.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(2);
      expect(response.body.impactTable[0].rows[0].name).toBe(
        'Material Level One 1',
      );
      expect(response.body.impactTable[0].rows[1].name).toBe(
        'Material Level One 2',
      );
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(3000);
    },
  );

  test(
    'When I query a Impact Chart grouped by material and filtered by level one ' +
      'And  do not specify level' +
      'Then I should get response structure starting from the level one materials  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'materialIds[]': [
            preconditions.materialsLevelOne[0].id,
            preconditions.materialsLevelOne[1].id,
          ],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(4);
      expect(response.body.impactTable[0].rows[0].name).toBe(
        'Material Level Two 1',
      );
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(1000);
      expect(
        response.body.impactTable[0].others.aggregatedValues[0].value,
      ).toBe(1000);
    },
  );

  test(
    'When I query a Impact Chart grouped by material and filtered by level one and level two' +
      'And  do not specify level' +
      'Then I should get response structure starting from the level two materials  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'materialIds[]': [
            preconditions.materialsLevelTwo[4].id,
            preconditions.materialsLevelTwo[3].id,
            preconditions.materialsLevelOne[0].id,
          ],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          maxRankingEntities: 5,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(5);
      expect(response.body.impactTable[0].rows[0].name).toBe(
        'Material Level Two 1',
      );
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(1000);
    },
  );
});
