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
import { createTwoScenariosPreconditions } from './scenario-impact-preconditions/two-scenarios.preconditions';
import { getDiffMaterialsScenariosComparison } from './scenario-comparison-responses/diff-materials-comparison.reponse';
import { createMixedScenariosPreconditions } from './scenario-comparison-preconditions/mixed-scenarios.preconditions';
import { getMultiInterventionsScenariosComparison } from './scenario-comparison-responses/multi-interventions-comparison.response';

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
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('When I request data for comaprison table for 2 single interventions scenario, then I should get correct data within expected structure', async () => {
    const preconditions: {
      newScenario1: Scenario;
      newScenario2: Scenario;
      indicator: Indicator;
    } = await createTwoScenariosPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/scenarios-table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2021,
        startYear: 2020,
        groupBy: 'material',
        scenarioIds: [
          preconditions.newScenario1.id,
          preconditions.newScenario2.id,
        ],
      });

    expect(response.status).toBe(HttpStatus.OK);

    const expectedScenariosTable = getDiffMaterialsScenariosComparison(
      preconditions.newScenario1.id,
      preconditions.newScenario2.id,
      preconditions.indicator.id,
    );

    expect(
      response.body.data.scenariosImpactTable[0].rows[0].values[0]
        .scenariosImpacts,
    ).toEqual(
      expect.arrayContaining(
        expectedScenariosTable.scenariosImpactTable[0].rows[0].values[0]
          .scenariosImpacts,
      ),
    );

    expect(
      response.body.data.scenariosImpactTable[0].rows[0].children[0].values[0]
        .scenariosImpacts,
    ).toEqual(
      expect.arrayContaining(
        expectedScenariosTable.scenariosImpactTable[0].rows[0].children[0]
          .values[0].scenariosImpacts,
      ),
    );

    expect(response.body.data.purchasedTonnes[0].values).toEqual(
      expect.arrayContaining(expectedScenariosTable.purchasedTonnes[0].values),
    );
  });

  test('When I request data for comaprison table for 2 multiple interventions scenario, then I should get correct data within expected structure', async () => {
    const preconditions: {
      indicator: Indicator;
      newScenarioChangeSupplier: Scenario;
      newScenarioChangeMaterial: Scenario;
    } = await createMixedScenariosPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/scenarios-table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2021,
        startYear: 2020,
        groupBy: 'material',
        scenarioIds: [
          preconditions.newScenarioChangeSupplier.id,
          preconditions.newScenarioChangeMaterial.id,
        ],
      });

    expect(response.status).toBe(HttpStatus.OK);

    const expectedScenariosTable = getMultiInterventionsScenariosComparison(
      preconditions.newScenarioChangeSupplier.id,
      preconditions.newScenarioChangeMaterial.id,
      preconditions.indicator.id,
    );

    expect(
      response.body.data.scenariosImpactTable[0].rows[0].values[0]
        .scenariosImpacts,
    ).toEqual(
      expect.arrayContaining(
        expectedScenariosTable.scenariosImpactTable[0].rows[0].values[0]
          .scenariosImpacts,
      ),
    );

    expect(
      response.body.data.scenariosImpactTable[0].rows[0].children[0].values[0]
        .scenariosImpacts,
    ).toEqual(
      expect.arrayContaining(
        expectedScenariosTable.scenariosImpactTable[0].rows[0].children[0]
          .values[0].scenariosImpacts,
      ),
    );

    expect(response.body.data.purchasedTonnes[0].values).toEqual(
      expect.arrayContaining(expectedScenariosTable.purchasedTonnes[0].values),
    );
  });
});
