import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createScenario,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../../entity-mocks';
import { v4 as uuidv4 } from 'uuid';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Unit } from 'modules/units/unit.entity';
import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material, MATERIALS_STATUS } from 'modules/materials/material.entity';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { setupTestUser } from '../../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import {
  filteredByLocationTypeResponseData,
  filteredByLocationTypeResponseData2,
  groupByBusinessUnitResponseData,
  groupByLocationTypeResponseData,
  groupByMaterialNestedResponseData,
  groupByMaterialNestedResponseDataForGrandchild,
  groupByMaterialResponseData,
  groupByOriginResponseData,
  groupBySupplierResponseData,
  impactTableWithScenario,
} from '../mocks/response-mocks.impact';
import { PaginationMeta } from 'utils/app-base.service';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../../utils/database-test-helper';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { createNewMaterialInterventionPreconditions } from '../mocks/actual-vs-scenario-preconditions/new-material-intervention.preconditions';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { DataSource } from 'typeorm';
import { GROUP_BY_VALUES, ORDER_BY } from 'modules/impact/dto/impact-table.dto';
import { ImpactTableRows } from 'modules/impact/dto/response-impact-table.dto';
import { createImpactTableSortingPreconditions } from '../mocks/sorting.preconditions';

describe('Impact Table and Charts test suite (e2e)', () => {
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
    ]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I query the API for an Impact Table but some of the required fields are missing then I should get a proper error message', async () => {
    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'each value in indicatorIds must be a UUID',
      'startYear should not be empty',
      'startYear must be a number conforming to the specified constraints',
      'endYear should not be empty',
      'endYear must be a number conforming to the specified constraints',
      'Available options: material,business-unit,region,t1Supplier,producer,location-type',
      'groupBy should not be empty',
      'groupBy must be a string',
    ]);
  });

  test('When I query the API for a Impact Table with correct params but there are not indicators to retrieve in the DB, then I should get a proper errors message ', async () => {
    await createIndicatorRecord();
    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [uuidv4(), uuidv4(), uuidv4()],
        endYear: 1,
        startYear: 2,
        groupBy: GROUP_BY_VALUES.MATERIAL,
      })
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.errors[0].title).toEqual(
      'No Indicator has been found with provided IDs',
    );
  });

  test('When I query the API for a Impact Table filtering by Inactive material, then I should get a proper errors message ', async () => {
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
      nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      status: INDICATOR_STATUS.ACTIVE,
    });

    const material: Material = await createMaterial({
      name: 'Fake Material',
      status: MATERIALS_STATUS.INACTIVE,
    });
    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        'materialIds[]': [material.id],
        endYear: 1,
        startYear: 2,
        groupBy: GROUP_BY_VALUES.MATERIAL,
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].title).toEqual(
      'Following Requested Materials are not activated: Fake Material',
    );
  });

  test('When I query the API for a Impact Table for inactive indicators then I should get a proper error message', async () => {
    const inactiveIndicator: Indicator = await createIndicator({
      name: 'Inactive Indicator 1',
      nameCode: 'IN_IND' as INDICATOR_NAME_CODES,
      status: INDICATOR_STATUS.INACTIVE,
    });

    const activeIndicator: Indicator = await createIndicator({
      name: 'active Indicator',
      nameCode: 'ACT_IND' as INDICATOR_NAME_CODES,
      status: INDICATOR_STATUS.ACTIVE,
    });
    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [inactiveIndicator.id, activeIndicator.id],
        endYear: 1,
        startYear: 2,
        groupBy: GROUP_BY_VALUES.MATERIAL,
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].title).toEqual(
      'Requested Indicators are not activated: Inactive Indicator 1',
    );
  });

  test('When I query the API for a Impact Table, then I should see all the data grouped by the requested entity', async () => {
    const material: Material = await createMaterial({ name: 'Fake Material' });
    const materialDescendant: Material = await createMaterial({
      name: 'Fake Material Descendant',
      parent: material,
    });
    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'Fake AdminRegion',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
      nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
    });

    const businessUnit: BusinessUnit = await createBusinessUnit({
      name: 'Fake Business Unit',
    });

    const supplier: Supplier = await createSupplier({ name: 'Fake Supplier' });
    const supplierDescendant: Supplier = await createSupplier({
      name: 'Fake Supplier Descendant',
      parent: supplier,
    });

    const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
      indicator,
    });
    const sourcingLocation: SourcingLocation = await createSourcingLocation({
      material: materialDescendant,
      businessUnit,
      t1Supplier: supplierDescendant,
      adminRegion,
    });

    for await (const year of [2010]) {
      await createSourcingRecord({
        year,
        indicatorRecords: [indicatorRecord],
        sourcingLocation,
      });
    }

    const response1 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.MATERIAL,
        'materialIds[]': [material.id],
      })
      .expect(HttpStatus.OK);

    expect(response1.body.data.impactTable[0].rows[0].name).toEqual(
      material.name,
    );
    expect(response1.body.data.impactTable[0].rows[0].values).toEqual([
      { year: 2010, value: 2000, isProjected: false },
      { year: 2011, value: 2030, isProjected: true },
      { year: 2012, value: 2060.45, isProjected: true },
    ]);

    expect(response1.body.data.impactTable[0].rows[0].children[0].name).toEqual(
      materialDescendant.name,
    );
    expect(
      response1.body.data.impactTable[0].rows[0].children[0].values,
    ).toEqual([
      { year: 2010, value: 2000, isProjected: false },
      { year: 2011, value: 2030, isProjected: true },
      { year: 2012, value: 2060.45, isProjected: true },
    ]);

    const response2 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.BUSINESS_UNIT,
      })
      .expect(HttpStatus.OK);

    expect(response2.body.data.impactTable[0].rows[0].name).toEqual(
      businessUnit.name,
    );

    const response3 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.T1_SUPPLIER,
      })
      .expect(HttpStatus.OK);

    expect(response3.body.data.impactTable[0].rows[0].name).toEqual(
      supplierDescendant.name,
    );

    const response5 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.PRODUCER,
      })
      .expect(HttpStatus.OK);

    const response4 = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.REGION,
      })
      .expect(HttpStatus.OK);

    expect(response4.body.data.impactTable[0].rows[0].name).toEqual(
      adminRegion.name,
    );
  });

  test('When I query the API for a Impact table, but requested range of years is not available, then I should get these years as projected values', async () => {
    const material: Material = await createMaterial({ name: 'Fake Material' });

    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'Fake AdminRegion',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
      nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
    });

    const businessUnit: BusinessUnit = await createBusinessUnit({
      name: 'Fake Business Unit',
    });

    const supplier: Supplier = await createSupplier({ name: 'Fake Supplier' });
    const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
      indicator,
    });
    const sourcingLocation: SourcingLocation = await createSourcingLocation({
      material,
      businessUnit,
      t1Supplier: supplier,
      adminRegion,
    });
    for await (const year of [2010]) {
      await createSourcingRecord({
        tonnage: 1000,
        year,
        indicatorRecords: [indicatorRecord],
        sourcingLocation,
      });
    }
    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.MATERIAL,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows[0].values).toHaveLength(3);
    expect(response.body.data.impactTable[0].rows[0].values[1].year).toEqual(
      2011,
    );
    expect(
      response.body.data.impactTable[0].rows[0].values[1].isProjected,
    ).toEqual(true);
    expect(response.body.data.impactTable[0].rows[0].values[1].value).toEqual(
      indicatorRecord.value + (indicatorRecord.value * 1.5) / 100,
    );
  });

  test('When I query the API for a Impact table Then I should get the calculated total purchased values', async () => {
    const material: Material = await createMaterial({ name: 'Fake Material' });

    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'Fake AdminRegion',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
      nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
    });

    const businessUnit: BusinessUnit = await createBusinessUnit({
      name: 'Fake Business Unit',
    });

    const supplier: Supplier = await createSupplier({ name: 'Fake Supplier' });
    const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
      indicator,
    });
    const sourcingLocation: SourcingLocation = await createSourcingLocation({
      material,
      businessUnit,
      t1Supplier: supplier,
      adminRegion,
    });
    for await (const year of [2010]) {
      await createSourcingRecord({
        tonnage: 1000,
        year,
        indicatorRecords: [indicatorRecord],
        sourcingLocation,
      });
    }
    const response = await request(testApplication.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: GROUP_BY_VALUES.MATERIAL,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.purchasedTonnes).toHaveLength(3);
    const previousNonProjectedValue =
      response.body.data.purchasedTonnes[0].value;
    expect(response.body.data.purchasedTonnes[1].isProjected).toEqual(true);
    expect(response.body.data.purchasedTonnes[1].value).toEqual(
      previousNonProjectedValue + (previousNonProjectedValue * 1.5) / 100,
    );
  });

  describe('Sorting Tests', () => {
    test('When I query the API for an impact table with an invalid sorting year, then I should get an error', async () => {
      //ARRANGE/ACT
      const response1 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [uuidv4()],
          'producerIds[]': [uuidv4()],
          sortingYear: 2019,
          endYear: 2021,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        });

      const response2 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [uuidv4()],
          'producerIds[]': [uuidv4()],
          sortingYear: 3145,
          endYear: 2030,
          startYear: 2025,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        });

      expect(response1.body.errors[0].meta.rawError.response.message).toEqual([
        'sortingYear must be have a value between startYear and endYear. 2020 and 2021 on this request.',
      ]);
      expect(response2.body.errors[0].meta.rawError.response.message).toEqual([
        'sortingYear must be have a value between startYear and endYear. 2025 and 2030 on this request.',
      ]);
    });

    test('When I query the API for an impact table sorted by a given year, Then I should get the correct data in descendent order by default ', async () => {
      //ARRANGE
      const data: any = await createImpactTableSortingPreconditions('Normal');
      const { indicator, supplier, parentMaterials, childMaterialParent1 } =
        data;

      // ACT
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          't1SupplierIds[]': [supplier.id],
          startYear: 2020,
          endYear: 2021,
          sortingYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        });
      const response2 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          't1SupplierIds[]': [supplier.id],
          startYear: 2020,
          endYear: 2021,
          sortingYear: 2021,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        });

      //ASSERT
      const reponse1OrderParents: string[] =
        response.body.data.impactTable[0].rows.map(
          (row: ImpactTableRows) => row.name,
        );
      const reponse1OrderMaterial1Children: string[] =
        response.body.data.impactTable[0].rows[2].children.map(
          (row: ImpactTableRows) => row.name,
        );
      expect(reponse1OrderParents).toEqual([
        parentMaterials[1].name,
        parentMaterials[2].name,
        parentMaterials[0].name,
      ]);
      expect(reponse1OrderMaterial1Children).toEqual([
        childMaterialParent1[2].name,
        childMaterialParent1[0].name,
        childMaterialParent1[1].name,
      ]);

      const reponse2OrderParents: string[] =
        response2.body.data.impactTable[0].rows.map(
          (row: ImpactTableRows) => row.name,
        );
      const reponse2OrderMaterial1Children: string[] =
        response2.body.data.impactTable[0].rows[1].children.map(
          (row: ImpactTableRows) => row.name,
        );
      expect(reponse2OrderParents).toEqual([
        parentMaterials[2].name,
        parentMaterials[0].name,
        parentMaterials[1].name,
      ]);
      expect(reponse2OrderMaterial1Children).toEqual([
        childMaterialParent1[1].name,
        childMaterialParent1[2].name,
        childMaterialParent1[0].name,
      ]);
    });

    test('When I query the API for an impact table sorted by a given year, it muse be ordered by the sortingOrder parameter ', async () => {
      //ARRANGE
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const parentMaterial1 = await createMaterial({
        name: 'Parent Fake Material 1',
      });
      const parentMaterial2 = await createMaterial({
        name: 'Parent Fake Material 2',
      });
      const parentMaterial3 = await createMaterial({
        name: 'Parent Fake Material 3',
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });

      const parentLocations: SourcingLocation[] = await Promise.all(
        [parentMaterial1, parentMaterial2, parentMaterial3].map(
          async (material: Material) =>
            await createSourcingLocation({
              material: material,
              businessUnit,
              t1Supplier: supplier,
              adminRegion,
            }),
        ),
      );

      await indicatorSourcingRecord(2020, 100, indicator, parentLocations[0]);
      await indicatorSourcingRecord(2020, 200, indicator, parentLocations[1]);
      await indicatorSourcingRecord(2020, 150, indicator, parentLocations[2]);

      // ACT
      const responseDesc = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          't1SupplierIds[]': [supplier.id],
          endYear: 2021,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          sortingYear: 2020,
          sortingOrder: ORDER_BY.DESC,
        });
      const response2Asc = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          't1SupplierIds[]': [supplier.id],
          endYear: 2021,
          startYear: 2020,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          sortingYear: 2020,
          sortingOrder: ORDER_BY.ASC,
        });

      //ASSERT
      const reponse1OrderParents: string[] =
        responseDesc.body.data.impactTable[0].rows.map(
          (row: ImpactTableRows) => row.name,
        );
      expect(reponse1OrderParents).toEqual([
        parentMaterial2.name,
        parentMaterial3.name,
        parentMaterial1.name,
      ]);

      const reponse2OrderParents: string[] =
        response2Asc.body.data.impactTable[0].rows.map(
          (row: ImpactTableRows) => row.name,
        );
      expect(reponse2OrderParents).toEqual([
        parentMaterial1.name,
        parentMaterial3.name,
        parentMaterial2.name,
      ]);
    });
  });
  describe('Group By tests', () => {
    test('When I query the API for a Impact table grouped by material with filters Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material1: Material = await createMaterial({
        name: 'Fake Material 1',
      });
      const material2: Material = await createMaterial({
        name: 'Fake Material 2',
      });

      const material3: Material = await createMaterial({
        name: 'Fake Material 3',
      });

      const material4: Material = await createMaterial({
        name: 'Fake Material 4',
        parent: material3,
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });

      const supplier2: Supplier = await createSupplier({
        name: 'Fake Supplier 2',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: material1,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });

      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: material2,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });

      await createSourcingLocation({
        material: material4,
        businessUnit,
        t1Supplier: supplier2,
        adminRegion,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing locations with different Materials
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 1000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 2000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          't1SupplierIds[]': [supplier.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        })
        .expect(HttpStatus.OK);

      // TODO: Refactor this tests when updating t1producer & supplier filters
      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      // expect(response.body.data.impactTable[0].rows).toEqual(
      //   expect.arrayContaining(groupByMaterialResponseData.rows),
      // );
      // expect(response.body.data.impactTable[0].yearSum).toEqual(
      //   expect.arrayContaining(groupByMaterialResponseData.yearSum),
      // );
    });

    test('When I query the API for a Impact table grouped by material Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const parentMaterial: Material = await createMaterial({
        name: 'Fake Material Parent',
      });
      const childMaterial: Material = await createMaterial({
        name: 'Fake Material Child',
        parent: parentMaterial,
      });
      const grandchildMaterial: Material = await createMaterial({
        name: 'Fake Material Grandchild',
        parent: childMaterial,
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: childMaterial,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });
      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: grandchildMaterial,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing locations with different Materials
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 2000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 1000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(1);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByMaterialNestedResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByMaterialNestedResponseData.yearSum),
      );
      /*
       * Even if we pass only one material id,
       * full tree for that id shoudl be returned
       */
      const responseWithFilter = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'materialIds[]': [childMaterial.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        })
        .expect(HttpStatus.OK);
      expect(responseWithFilter.body.data.impactTable[0].rows).toHaveLength(1);
      expect(responseWithFilter.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByMaterialNestedResponseData.rows),
      );
      expect(responseWithFilter.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByMaterialNestedResponseData.yearSum),
      );

      const responseWithGrandchildFilter = await request(
        testApplication.getHttpServer(),
      )
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'materialIds[]': [grandchildMaterial.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        })
        .expect(HttpStatus.OK);

      expect(
        responseWithGrandchildFilter.body.data.impactTable[0].rows,
      ).toHaveLength(1);
      expect(
        responseWithGrandchildFilter.body.data.impactTable[0].rows,
      ).toEqual(
        expect.arrayContaining(
          groupByMaterialNestedResponseDataForGrandchild.rows,
        ),
      );
      expect(
        responseWithGrandchildFilter.body.data.impactTable[0].yearSum,
      ).toEqual(
        expect.arrayContaining(
          groupByMaterialNestedResponseDataForGrandchild.yearSum,
        ),
      );
    });

    test('When I query the API for a Impact table grouped by region Then I should get the correct data', async () => {
      const adminRegion1: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion 1',
      });

      const adminRegion2: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion 2',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material: Material = await createMaterial({
        name: 'Fake Material',
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit,
        t1Supplier: supplier,
        adminRegion: adminRegion1,
      });

      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit,
        t1Supplier: supplier,
        adminRegion: adminRegion2,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing locations with different Admin Regions
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 600 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 500 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.REGION,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByOriginResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByOriginResponseData.yearSum),
      );
    });

    test('When I query the API for a Impact table grouped by Supplier Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });

      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material: Material = await createMaterial({
        name: 'Fake Material',
      });

      const material2: Material = await createMaterial({
        name: 'Fake Material 2',
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier1: Supplier = await createSupplier({
        name: 'Fake Supplier 1',
      });

      const supplier2: Supplier = await createSupplier({
        name: 'Fake Supplier 2',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit,
        t1Supplier: supplier1,
        adminRegion: adminRegion,
      });

      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: material2,
        businessUnit,
        t1Supplier: supplier2,
        adminRegion: adminRegion,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing locations with different Suppliers
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 100 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 300 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.T1_SUPPLIER,
        })
        .expect(HttpStatus.OK);

      const response2 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.T1_SUPPLIER,
          'materialIds[]': [material2.id],
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupBySupplierResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupBySupplierResponseData.yearSum),
      );

      expect(response2.body.data.impactTable[0].rows).toHaveLength(1);
      expect(response2.body.data.impactTable[0].rows[0]).toEqual(
        groupBySupplierResponseData.rows[1],
      );
    });

    test('When I query the API for a Impact table grouped by business unit Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });

      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material: Material = await createMaterial({
        name: 'Fake Material',
      });

      const businessUnit1: BusinessUnit = await createBusinessUnit({
        name: 'Fake BusinessUnit 1',
      });

      const businessUnit2: BusinessUnit = await createBusinessUnit({
        name: 'Fake BusinessUnit 2',
      });

      const supplier1: Supplier = await createSupplier({
        name: 'Fake Supplier 1',
      });

      const supplier2: Supplier = await createSupplier({
        name: 'Fake Supplier 2',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit: businessUnit1,
        t1Supplier: supplier1,
        adminRegion: adminRegion,
      });

      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit: businessUnit2,
        t1Supplier: supplier2,
        adminRegion: adminRegion,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing locations with different Business Units
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 100 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 300 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.BUSINESS_UNIT,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByBusinessUnitResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByBusinessUnitResponseData.yearSum),
      );
    });

    test('When I query the API for a Impact table grouped by location type Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });

      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material: Material = await createMaterial({
        name: 'Fake Material',
      });

      const businessUnit1: BusinessUnit = await createBusinessUnit({
        name: 'Fake BusinessUnit 1',
      });

      const supplier1: Supplier = await createSupplier({
        name: 'Fake Supplier 1',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit: businessUnit1,
        t1Supplier: supplier1,
        adminRegion: adminRegion,
        locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
      });

      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: material,
        businessUnit: businessUnit1,
        t1Supplier: supplier1,
        adminRegion: adminRegion,
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing Locations of different location types

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;

        // Indicator and Sourcing Records for 'Country of Production' location type
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 100 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        // Indicator and Sourcing Records for 'Aggregation Point' location type
        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 300 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.LOCATION_TYPE,
        })
        .expect(HttpStatus.OK);

      const impactTable = response.body.data.impactTable[0];
      // expect(impactTable.rows.sort()).toEqualArrayUnordered(
      //   groupByLocationTypeResponseData.rows,
      // );
      // expect(impactTable.yearSum).toEqualArrayUnordered(
      //   groupByLocationTypeResponseData.yearSum,
      // );
      expect(impactTable.rows).toEqual(
        groupByLocationTypeResponseData.rows.sort((a: any, b: any) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
        ),
      );
      expect(impactTable.yearSum).toEqual(
        groupByLocationTypeResponseData.yearSum,
      );
    });
  });

  describe('Pagination tests', () => {
    test('Pagination should paginate root elements of entities', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material1: Material = await createMaterial({
        name: 'Fake Material 1',
      });
      const material2: Material = await createMaterial({
        name: 'Fake Material 2',
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });

      const sourcingLocation1: SourcingLocation = await createSourcingLocation({
        material: material1,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });

      const sourcingLocation2: SourcingLocation = await createSourcingLocation({
        material: material2,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing Locations for Fake Material 1 and Fake Material 2
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 1000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1,
        });

        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 2000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'page[size]': 1,
          'page[number]': 1,
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        })
        .expect(HttpStatus.OK);
      const responseSecondPage = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'page[size]': 1,
          'page[number]': 2,
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
        })
        .expect(HttpStatus.OK);
      const paginationMetadata: PaginationMeta = new PaginationMeta({
        totalItems: 2,
        totalPages: 2,
        size: 1,
        page: 1,
      });

      expect(response.body.metadata).toEqual(paginationMetadata);
      paginationMetadata.page = 2;
      expect(responseSecondPage.body.metadata).toEqual(paginationMetadata);
      expect(response.body.data.impactTable[0].rows).toHaveLength(1);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining([groupByMaterialResponseData.rows[0]]),
      );

      expect([
        ...response.body.data.impactTable[0].rows,
        ...responseSecondPage.body.data.impactTable[0].rows,
      ]).toEqual(expect.arrayContaining(groupByMaterialResponseData.rows));

      expect(response.body.data.impactTable[0].yearSum[0].value).toEqual(
        groupByMaterialResponseData.yearSum[0].value,
      );
    });
  });

  describe('Filters Tests', () => {
    test('When I query the API for a Impact table with Location Type filters Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });

      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_NAME_CODES.DEFORESTATION_RISK,
      });

      const material: Material = await createMaterial({
        name: 'Fake Material',
      });

      //Only entities with data related to the specified filters should show on the impact table, so this Material should now show
      const material2: Material = await createMaterial({
        name: 'Fake Material different 2',
      });

      const businessUnit1: BusinessUnit = await createBusinessUnit({
        name: 'Fake BusinessUnit 1',
      });

      const supplier1: Supplier = await createSupplier({
        name: 'Fake Supplier 1',
      });

      const sourcingLocation1Material1: SourcingLocation =
        await createSourcingLocation({
          material: material,
          businessUnit: businessUnit1,
          t1Supplier: supplier1,
          adminRegion: adminRegion,
          locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
        });

      const sourcingLocation2Material1: SourcingLocation =
        await createSourcingLocation({
          material: material,
          businessUnit: businessUnit1,
          t1Supplier: supplier1,
          adminRegion: adminRegion,
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        });

      await createSourcingLocation({
        material: material2,
        businessUnit: businessUnit1,
        t1Supplier: supplier1,
        adminRegion: adminRegion,
        locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
      });

      // Creating Sourcing Records and Indicator Records for previously created Sourcing Locations of different Location Types
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;

        // Indicator Records and Sourcing Records for 'Country of Production' type
        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 100 + index / 0.02,
          indicator,
        });
        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord1],
          sourcingLocation: sourcingLocation1Material1,
        });

        // Indicator Records and Sourcing Records for 'Aggregation point' type
        const indicatorRecord2: IndicatorRecord = await createIndicatorRecord({
          value: 300 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord2],
          sourcingLocation: sourcingLocation2Material1,
        });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.MATERIAL,
          'locationTypes[]': [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT],
        });
      const response2 = await request(testApplication.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: GROUP_BY_VALUES.LOCATION_TYPE,
          'locationTypes[]': [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT],
        });
      //.expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toEqualArrayUnordered(
        filteredByLocationTypeResponseData.rows,
      );
      expect(response.body.data.impactTable[0].yearSum).toEqualArrayUnordered(
        filteredByLocationTypeResponseData.yearSum,
      );

      expect(response2.body.data.impactTable[0].rows).toEqualArrayUnordered(
        filteredByLocationTypeResponseData2.rows,
      );
      expect(response2.body.data.impactTable[0].yearSum).toEqualArrayUnordered(
        filteredByLocationTypeResponseData2.yearSum,
      );
    });
  });

  describe('Impact Table including Scenario Tests', () => {
    test(
      'When I query a Impact Table ' +
        'And I include a Scenario Id ' +
        'Then I should see the elements included in that Scenario among the actual data ' +
        'ignoring interventions with status INACTIVE.' +
        ' Past years with no values should have property isProjected false',
      async () => {
        const scenario: Scenario = await createScenario();
        const { replacedMaterials, replacingMaterials, indicator } =
          await createNewMaterialInterventionPreconditions(scenario);

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/impact/table')
          .set('Authorization', `Bearer ${jwtToken}`)
          .query({
            'indicatorIds[]': [indicator.id],
            endYear: 2022,
            startYear: 2017,
            groupBy: GROUP_BY_VALUES.MATERIAL,
            scenarioId: scenario.id,
          });

        expect(
          response.body.data.impactTable[0].rows[0].children.some(
            (child: Material) => child.id === replacedMaterials['cotton'].id,
          ),
        );

        expect(
          response.body.data.impactTable[0].rows[0].children.some(
            (child: Material) => child.id === replacingMaterials['linen'].id,
          ),
        );

        expect(response.body.data.impactTable[0].rows).toEqual(
          impactTableWithScenario.impactTable[0].rows,
        );
        expect(response.body.data.impactTable[0].yearSum).toEqual(
          impactTableWithScenario.impactTable[0].yearSum,
        );
      },
    );
  });
});

async function indicatorSourcingRecord(
  year: number,
  value: number,
  indicator: Indicator,
  sourcingLocation: SourcingLocation,
  tonnage: number = 100,
): Promise<void> {
  const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
    value,
    indicator,
  });
  await createSourcingRecord({
    tonnage,
    year,
    indicatorRecords: [indicatorRecord],
    sourcingLocation,
  });
}
