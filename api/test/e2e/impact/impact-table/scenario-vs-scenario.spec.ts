import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Indicator } from 'modules/indicators/indicator.entity';
import { setupTestUser } from '../../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../../utils/database-test-helper';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import { H3Data } from 'modules/h3-data/entities/h3-data.entity';
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
import { createImpactTableSortingPreconditions } from '../mocks/sorting.preconditions';
import { ImpactTableRows } from 'modules/impact/dto/response-impact-table.dto';
import { GROUP_BY_VALUES } from 'modules/impact/dto/impact-table.dto';

describe('Scenario VS Scenario Impact Table test suite (e2e)', () => {
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
    await testApplication.close();
  });

  test('When I request scenario comparison for 2 Scenarios, then I should get the correct response within expected structure', async () => {
    const preconditions: {
      newScenarioChangeSupplier: Scenario;
      newScenarioChangeMaterial: Scenario;
      indicator: Indicator;
    } = await createSameMaterialScenariosPreconditions();

    const responseGroupByMaterial = await request(
      testApplication.getHttpServer(),
    )
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

    const responseGroupBySupplier = await request(
      testApplication.getHttpServer(),
    )
      .get('/api/v1/impact/compare/scenario/vs/scenario')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2021,
        startYear: 2020,
        groupBy: GROUP_BY_VALUES.T1_SUPPLIER,
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

      const response = await request(testApplication.getHttpServer())
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

  describe('Sorting Tests', () => {
    test('When I query the API for an Actual Vs Scenario mpact table sorted by a given year, Then I should get the correct data in ascendant order by default ', async () => {
      //ARRANGE
      const data: any = await createImpactTableSortingPreconditions(
        'ScenarioVsScenario',
      );
      const {
        indicator,
        supplier,
        scenario,
        comparedScenario,
        parentMaterials,
        childMaterialParent1,
      } = data;

      // ACT
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/compare/scenario/vs/scenario')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          't1SupplierIds[]': [supplier.id],
          sortingYear: 2020,
          endYear: 2021,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          baseScenarioId: scenario.id,
          comparedScenarioId: comparedScenario.id,
        });

      //ASSERT
      const response1OrderParents: string[] =
        response.body.data.impactTable[0].rows.map(
          (row: ImpactTableRows) => row.name,
        );
      const response1OrderMaterial1Children: string[] =
        response.body.data.impactTable[0].rows[1].children.map(
          (row: ImpactTableRows) => row.name,
        );
      expect(response1OrderParents).toEqual([
        parentMaterials[1].name,
        parentMaterials[0].name,
        parentMaterials[2].name,
      ]);
      expect(response1OrderMaterial1Children).toEqual([
        childMaterialParent1[1].name,
        childMaterialParent1[2].name,
        childMaterialParent1[0].name,
      ]);
    });
  });
});
