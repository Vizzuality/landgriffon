import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Indicator } from 'modules/indicators/indicator.entity';
import { setupTestUser } from '../../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { Intervention } from 'modules/interventions/intervention.entity';
import { createNewMaterialInterventionPreconditions } from '../mocks/actual-vs-scenario-preconditions/new-material-intervention.preconditions';
import { createNewCoefficientsInterventionPreconditions } from '../mocks/actual-vs-scenario-preconditions/new-coefficients-intervention.preconditions';
import { newCoefficientsScenarioInterventionTable } from '../mocks/actual-vs-scenario-responses/new-coefficients-intervention.response';
import { newMaterialScenarioInterventionTable } from '../mocks/actual-vs-scenario-responses/new-materials-intervention.response';
import { createNewSupplierInterventionPreconditions } from '../mocks/actual-vs-scenario-preconditions/new-supplier-intervention.preconditions';
import { newSupplierScenarioInterventionTable } from '../mocks/actual-vs-scenario-responses/new-supplier-intervention.response';
import { createMultipleInterventionsPreconditions } from '../mocks/actual-vs-scenario-preconditions/mixed-interventions-scenario.preconditions';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  mixedInterventionsScenarioTable,
  mixedInterventionsScenarioTable2019,
} from '../mocks/actual-vs-scenario-responses/mixed-interventions-scenario.response';
import {
  clearTestDataFromDatabase,
  clearEntityTables,
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
import { createScenario } from '../../../entity-mocks';
import { DataSource } from 'typeorm';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { createImpactTableSortingPreconditions } from '../mocks/sorting.preconditions';
import { ImpactTableRows } from 'modules/impact/dto/response-impact-table.dto';

describe('Actual VS Scenario Impact Table test suite (e2e)', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
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
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Coefficients I should get the expected results ignoring INACTIVE interventions', async () => {
    const scenario: Scenario = await createScenario();
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: Intervention;
    } = await createNewCoefficientsInterventionPreconditions(scenario);

    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        comparedScenarioId: preconditions.scenarioIntervention.scenarioId,
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

  test('When I request data for Impact table for a Scenario with Intervention of type New Material I should get the expected results ignoring INACTIVE interventions', async () => {
    const scenario: Scenario = await createScenario();
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: Intervention;
    } = await createNewMaterialInterventionPreconditions(scenario);

    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        comparedScenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newMaterialScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Supplier I should get the expected results ignoring INACTIVE interventions', async () => {
    const scenario: Scenario = await createScenario();
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: Intervention;
    } = await createNewSupplierInterventionPreconditions(scenario);

    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'supplier',
        comparedScenarioId: scenario.id,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newSupplierScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test(
    'When I request data for Impact table for a Scenario with various Interventions of different types I should get the expected results ignoring INACTIVE interventions. ' +
      'Past years with no data should have isProjected property as false',
    async () => {
      const preconditions: {
        indicator: Indicator;
        newScenario: Scenario;
      } = await createMultipleInterventionsPreconditions();

      const response1 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/compare/scenario/vs/actual')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2023,
          startYear: 2020,
          groupBy: 'material',
          comparedScenarioId: preconditions.newScenario.id,
        })
        .expect(HttpStatus.OK);

      expect(response1.body.data.impactTable[0].rows).toEqual(
        mixedInterventionsScenarioTable.impactTable[0].rows,
      );

      const response2 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/compare/scenario/vs/actual')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [preconditions.indicator.id],
          endYear: 2023,
          startYear: 2019,
          groupBy: 'material',
          comparedScenarioId: preconditions.newScenario.id,
        })
        .expect(HttpStatus.OK);

      expect(response2.body.data.impactTable[0].rows).toEqual(
        mixedInterventionsScenarioTable2019.impactTable[0].rows,
      );
    },
  );

  test('When I request data for Comparison Impact table for a Scenario with various Interventions of different types grouped by Suppliers, I should receive the table grouped by Suppliers', async () => {
    const preconditions: {
      indicator: Indicator;
      newScenario: Scenario;
    } = await createMultipleInterventionsPreconditions();

    const response1 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'supplier',
        comparedScenarioId: preconditions.newScenario.id,
      })
      .expect(HttpStatus.OK);

    expect(response1.body.data.impactTable[0].rows[0].name).toEqual(
      'Supplier A',
    );
    expect(response1.body.data.impactTable[0].rows[1].name).toEqual(
      'Supplier B',
    );

    const response2 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2019,
        groupBy: 'supplier',
        comparedScenarioId: preconditions.newScenario.id,
      })
      .expect(HttpStatus.OK);

    expect(response2.body.data.impactTable[0].rows[0].name).toEqual(
      'Supplier A',
    );
    expect(response2.body.data.impactTable[0].rows[1].name).toEqual(
      'Supplier B',
    );
  });

  describe('Sorting Tests', () => {
    test('When I query the API for an Actual Vs Scenario Impact table sorted by a given year, Then I should get the correct ordered data, in ascendant order by default ', async () => {
      //ARRANGE
      const data: any = await createImpactTableSortingPreconditions(
        'ActualVsScenario',
      );
      const {
        indicator,
        supplier,
        scenario,
        parentMaterials,
        childMaterialParent1,
      } = data;

      // ACT
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/compare/scenario/vs/actual')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'supplierIds[]': [supplier.id],
          sortingYear: 2020,
          endYear: 2021,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          comparedScenarioId: scenario.id,
        });

      //ASSERT
      const response1OrderParents: string[] =
        response.body.data.impactTable[0].rows.map(
          (row: ImpactTableRows) => row.name,
        );
      const response1OrderMaterial1Children: string[] =
        response.body.data.impactTable[0].rows[2].children.map(
          (row: ImpactTableRows) => row.name,
        );
      expect(response1OrderParents).toEqual([
        parentMaterials[1].name,
        parentMaterials[2].name,
        parentMaterials[0].name,
      ]);
      expect(response1OrderMaterial1Children).toEqual([
        childMaterialParent1[0].name,
        childMaterialParent1[1].name,
        childMaterialParent1[2].name,
      ]);
    });
  });
});
