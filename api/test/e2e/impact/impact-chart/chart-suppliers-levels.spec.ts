import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { setupTestUser } from '../../../utils/userAuth';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { Indicator } from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import { createNestedSuppliersPreconditions } from '../mocks/chart-levels-preconditions/nested-suppliers.preconditions';
import { Supplier } from '../../../../src/modules/suppliers/supplier.entity';
import { GROUP_BY_VALUES } from '../../../../src/modules/h3-data/dto/get-impact-map.dto';

describe('Impact Chart (Ranking) Test Suite (e2e) with requested levels for Admin Regions', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;
  let preconditions: {
    indicator: Indicator;
    rootSupplier: Supplier;
    suppliersLevelOne: Supplier[];
    suppliersLevelTwo: Supplier[];
  };

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));

    preconditions = await createNestedSuppliersPreconditions();
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test(
    'When I query a Impact Chart grouped by supplier ' +
      'And  do not specify level' +
      'Then I should get response structure starting from the highest level (root supplier)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.SUPPLIER,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(1);
      expect(response.body.impactTable[0].rows[0].name).toBe('Root Supplier');
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(5000);
    },
  );

  test(
    'When I query a Impact Chart grouped by supplier and filtered by root supplier id ' +
      'And  do not specify depth level' +
      'Then I should get response structure starting from the suppliers of level one (children of root supplier)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'supplierIds[]': [preconditions.rootSupplier.id],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.SUPPLIER,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(2);
      expect(response.body.impactTable[0].rows[0].name).toBe(
        'Supplier Level One 1',
      );
      expect(response.body.impactTable[0].rows[1].name).toBe(
        'Supplier Level One 2',
      );
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(3000);
    },
  );

  test(
    'When I query a Impact Chart grouped by supplier and filtered by level one supplier id ' +
      'And  do not specify depth level' +
      'Then I should get response structure starting from the suppliers of level two (children of level one supplier)  ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'supplierIds[]': [
            preconditions.suppliersLevelOne[0].id,
            preconditions.suppliersLevelOne[1].id,
          ],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.SUPPLIER,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(4);
      expect(response.body.impactTable[0].rows[0].name).toBe(
        'Supplier Level Two 1',
      );
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(1000);
      expect(
        response.body.impactTable[0].others.aggregatedValues[0].value,
      ).toBe(1000);
    },
  );

  test(
    'When I query a Impact Chart grouped by supplier and filtered by level one and level two supplier ids ' +
      'And  do not specify depth level' +
      'Then I should get response structure starting from the suppliers of level two (children of level one supplier) as the lowest available level ',
    async () => {
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          'supplierIds[]': [
            preconditions.suppliersLevelOne[0].id,
            preconditions.suppliersLevelTwo[4].id,
          ],
          endYear: 2020,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.SUPPLIER,
          maxRankingEntities: 4,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      expect(response.body.impactTable[0].rows.length).toBe(4);
      expect(response.body.impactTable[0].rows[0].name).toBe(
        'Supplier Level Two 1',
      );
      expect(response.body.impactTable[0].rows[0].values[0].value).toBe(1000);
      expect(
        response.body.impactTable[0].others.aggregatedValues[0].value,
      ).toBe(0);
    },
  );
});
