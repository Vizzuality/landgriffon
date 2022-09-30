import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { ImpactModule } from 'modules/impact/impact.module';
import { Indicator } from 'modules/indicators/indicator.entity';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { createNewMaterialInterventionPreconditions } from './scenario-impact-preconditions/new-material-intervention.preconditions';
import { createNewCoefficientsInterventionPreconditions } from './scenario-impact-preconditions/new-coefficients-intervention.preconditions';
import { newCoefficientsScenarioInterventionTable } from './scenario-impact-responses/new-coefficients-intervention.response';
import { newMaterialScenarioInterventionTable } from './scenario-impact-responses/new-materials-intervention.response';
import { createNewSupplierInterventionPreconditions } from './scenario-impact-preconditions/new-supplier-intervention.preconditions';
import { newSupplierScenarioInterventionTable } from './scenario-impact-responses/new-supplier-intervention.response';
import { createMultipleInterventionsPreconditions } from './scenario-impact-preconditions/mixed-interventions-scenario.preconditions';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  mixedInterventionsScenarioTable,
  mixedInterventionsScenarioTable2019,
} from './scenario-impact-responses/mixed-interventions-scenario.response';
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

describe('Impact Table and Charts test suite (e2e)', () => {
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
      Scenario,
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
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Coefficients I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: ScenarioIntervention;
    } = await createNewCoefficientsInterventionPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newCoefficientsScenarioInterventionTable.impactTable[0].rows,
    );
    expect(response.body.data.impactTable[0].yearSum).toEqual(
      newCoefficientsScenarioInterventionTable.impactTable[0].yearSum,
    );
    expect(response.body.data.purchasedTonnes).toEqual(
      newCoefficientsScenarioInterventionTable.purchasedTonnes,
    );
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Material I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: ScenarioIntervention;
    } = await createNewMaterialInterventionPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newMaterialScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Supplier I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: ScenarioIntervention;
    } = await createNewSupplierInterventionPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'supplier',
        scenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newSupplierScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test('When I request data for Impact table for a Scenario with various Interventions of different types I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      newScenario: Scenario;
    } = await createMultipleInterventionsPreconditions();

    const response1 = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: preconditions.newScenario.id,
      })
      .expect(HttpStatus.OK);

    expect(response1.body.data.impactTable[0].rows).toEqual(
      mixedInterventionsScenarioTable.impactTable[0].rows,
    );

    const response2 = await request(app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2019,
        groupBy: 'material',
        scenarioId: preconditions.newScenario.id,
      })
      .expect(HttpStatus.OK);

    expect(response2.body.data.impactTable[0].rows).toEqual(
      mixedInterventionsScenarioTable2019.impactTable[0].rows,
    );
  });
});
