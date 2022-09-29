import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { ImpactModule } from 'modules/impact/impact.module';
import { Indicator } from 'modules/indicators/indicator.entity';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { clearEntityTables } from '../../utils/database-test-helper';
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
  getSameMaterialScenarioComparisonResponse,
  getScenarioComparisonResponseBySupplier,
} from './scenario-vs-scenario-responses/same-materials-scenarios.reponse';
import { createSameMaterialScenariosPreconditions } from './scenario-vs-scenario-preconditions/same-materials-scenarios.preconditions';

describe('Scenario comparison test suite (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImpactModule],
    }).compile();

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await clearEntityTables([
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
        scenarioOneId: preconditions.newScenarioChangeSupplier.id,
        scenarioTwoId: preconditions.newScenarioChangeMaterial.id,
      });

    expect(responseGroupByMaterial.status).toBe(HttpStatus.OK);

    const expectedScenariosTableMByMaterial =
      getSameMaterialScenarioComparisonResponse(preconditions.indicator.id);

    expect(
      responseGroupByMaterial.body.data.scenarioVsScenarioImpactTable[0].rows,
    ).toEqual(
      expect.arrayContaining(
        expectedScenariosTableMByMaterial.scenarioVsScenarioImpactTable[0].rows,
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
        scenarioOneId: preconditions.newScenarioChangeSupplier.id,
        scenarioTwoId: preconditions.newScenarioChangeMaterial.id,
      });

    expect(responseGroupBySupplier.status).toBe(HttpStatus.OK);

    const expectedScenariosTableBySupplier =
      getScenarioComparisonResponseBySupplier(preconditions.indicator.id);

    expect(
      responseGroupBySupplier.body.data.scenarioVsScenarioImpactTable[0].rows,
    ).toEqual(
      expect.arrayContaining(
        expectedScenariosTableBySupplier.scenarioVsScenarioImpactTable[0].rows,
      ),
    );
    expect(responseGroupBySupplier.body.data.purchasedTonnes).toEqual(
      expect.arrayContaining(expectedScenariosTableBySupplier.purchasedTonnes),
    );
  });
});
