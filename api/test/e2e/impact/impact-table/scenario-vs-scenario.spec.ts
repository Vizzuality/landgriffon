import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Indicator } from 'modules/indicators/indicator.entity';
import { saveUserAndGetTokenWithUserId } from '../../../utils/userAuth';
import AppSingleton from '../../../utils/getApp';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../../utils/database-test-helper';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { Material } from 'modules/materials/material.entity';
import { Unit } from 'modules/units/unit.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import {
  getComparisonResponseWithProjectedYears,
  getSameMaterialScenarioComparisonResponse,
  getScenarioComparisonResponseBySupplier,
} from '../mocks/scenario-vs-scenario-responses/same-materials-scenarios.reponse';
import { createSameMaterialScenariosPreconditions } from '../mocks/scenario-vs-scenario-preconditions/same-materials-scenarios.preconditions';
import { DataSource } from 'typeorm';

describe('Scenario comparison test suite (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
      IndicatorRecord,
      MaterialToH3,
      H3Data,
      Material,
      Indicator,
      Unit,
      BusinessUnit,
      AdminRegion,
      GeoRegion,
      Supplier,
      SourcingRecord,
      SourcingLocation,
      SourcingLocationGroup,
      Scenario,
    ]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });

  test('When I request scenario comparison for 2 Scenarios, then I should get the correct response within expected structure', async () => {
    const preconditions: {
      newScenarioChangeSupplier: Scenario;
      newScenarioChangeMaterial: Scenario;
      indicator: Indicator;
    } = await createSameMaterialScenariosPreconditions();

    const responseGroupByMaterial = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/scenario')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2021,
        startYear: 2020,
        groupBy: 'material',
        baseScenarioId: preconditions.newScenarioChangeSupplier.id,
        comparedScenarioId: preconditions.newScenarioChangeMaterial.id,
      });

    expect(responseGroupByMaterial.status).toBe(HttpStatus.OK);

    const expectedScenariosTableMByMaterial =
      getSameMaterialScenarioComparisonResponse(preconditions.indicator.id);

    expect(responseGroupByMaterial.body.data.impactTable[0].rows).toEqual(
      expect.arrayContaining(
        expectedScenariosTableMByMaterial.impactTable[0].rows,
      ),
    );
    expect(responseGroupByMaterial.body.data.impactTable[0].yearSum).toEqual(
      expect.arrayContaining(
        expectedScenariosTableMByMaterial.impactTable[0].yearSum,
      ),
    );
    expect(responseGroupByMaterial.body.data.purchasedTonnes).toEqual(
      expect.arrayContaining(expectedScenariosTableMByMaterial.purchasedTonnes),
    );

    const responseGroupBySupplier = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/scenario')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2021,
        startYear: 2020,
        groupBy: 'supplier',
        baseScenarioId: preconditions.newScenarioChangeSupplier.id,
        comparedScenarioId: preconditions.newScenarioChangeMaterial.id,
      });

    expect(responseGroupBySupplier.status).toBe(HttpStatus.OK);

    const expectedScenariosTableBySupplier =
      getScenarioComparisonResponseBySupplier(preconditions.indicator.id);

    expect(responseGroupBySupplier.body.data.impactTable[0].rows).toEqual(
      expect.arrayContaining(
        expectedScenariosTableBySupplier.impactTable[0].rows,
      ),
    );
    expect(responseGroupBySupplier.body.data.purchasedTonnes).toEqual(
      expect.arrayContaining(expectedScenariosTableBySupplier.purchasedTonnes),
    );
  });

  test(
    'When I request scenario comparison for 2 Scenarios choosing start year and end year for which there is no actual data. ' +
      'Then in the result past years with no data should have 0 value and isProjected:false, while future year should have projected values and isProjected: false',
    async () => {
      const preconditions: {
        newScenarioChangeSupplier: Scenario;
        newScenarioChangeMaterial: Scenario;
        indicator: Indicator;
      } = await createSameMaterialScenariosPreconditions();

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/compare/scenario/vs/scenario')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2022,
          startYear: 2018,
          groupBy: 'material',
          baseScenarioId: preconditions.newScenarioChangeSupplier.id,
          comparedScenarioId: preconditions.newScenarioChangeMaterial.id,
        });

      expect(response.status).toBe(HttpStatus.OK);

      const expectedScenariosTableMByMaterial =
        getComparisonResponseWithProjectedYears(preconditions.indicator.id);

      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(
          expectedScenariosTableMByMaterial.impactTable[0].rows,
        ),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(
          expectedScenariosTableMByMaterial.impactTable[0].yearSum,
        ),
      );
      expect(response.body.data.purchasedTonnes).toEqual(
        expect.arrayContaining(
          expectedScenariosTableMByMaterial.purchasedTonnes,
        ),
      );
    },
  );
});
