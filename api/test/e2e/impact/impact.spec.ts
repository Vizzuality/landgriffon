import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../entity-mocks';
import { v4 as uuidv4 } from 'uuid';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { ImpactModule } from 'modules/impact/impact.module';
import { Unit } from 'modules/units/unit.entity';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material } from 'modules/materials/material.entity';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import {
  filteredByLocationTypeResponseData,
  groupByBusinessUnitResponseData,
  groupByLocationTypeResponseData,
  groupByMaterialNestedResponseData,
  groupByMaterialNestedResponseDataForGrandchild,
  groupByMaterialResponseData,
  groupByOriginResponseData,
  groupBySupplierResponseData,
} from './response-mocks.impact';
import { PaginationMeta } from 'utils/app-base.service';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';
import { clearEntityTables } from '../../utils/database-test-helper';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { createNewMaterialInterventionPreconditions } from './scenario-impact-preconditions/new-material-intervention.preconditions';

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

  test('When I query the API for an Impact Table but some of the required fields are missing then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'each value in indicatorIds must be a UUID',
      'startYear should not be empty',
      'startYear must be a number conforming to the specified constraints',
      'endYear should not be empty',
      'endYear must be a number conforming to the specified constraints',
      'Available options: material,business-unit,region,supplier,location-type',
      'groupBy should not be empty',
      'groupBy must be a string',
    ]);
  });

  test('When I query the API for a Impact Table with correct params but there are not indicators to retrieve in the DB, then I should get a proper errors message ', async () => {
    await createIndicatorRecord();
    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [uuidv4(), uuidv4(), uuidv4()],
        endYear: 1,
        startYear: 2,
        groupBy: 'material',
      })
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.errors[0].title).toEqual(
      'No Indicator has been found with provided IDs',
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
      nameCode: INDICATOR_TYPES.DEFORESTATION,
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

    const response1 = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: 'material',
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

    const response2 = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: 'business-unit',
      })
      .expect(HttpStatus.OK);

    expect(response2.body.data.impactTable[0].rows[0].name).toEqual(
      businessUnit.name,
    );

    const response3 = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: 'supplier',
      })
      .expect(HttpStatus.OK);

    expect(response3.body.data.impactTable[0].rows[0].name).toEqual(
      supplier.name,
    );
    const response4 = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: 'region',
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
      nameCode: INDICATOR_TYPES.DEFORESTATION,
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
    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: 'material',
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
      nameCode: INDICATOR_TYPES.DEFORESTATION,
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
    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2012,
        startYear: 2010,
        groupBy: 'material',
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

  describe('Group By tests', () => {
    test('When I query the API for a Impact table grouped by material with filters Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'supplierIds[]': [supplier.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByMaterialResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByMaterialResponseData.yearSum),
      );
    });

    test('When I query the API for a Impact table grouped by material Then I should get the correct data', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
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
      const responseWithFilter = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'materialIds[]': [childMaterial.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
        })
        .expect(HttpStatus.OK);
      expect(responseWithFilter.body.data.impactTable[0].rows).toHaveLength(1);
      expect(responseWithFilter.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByMaterialNestedResponseData.rows),
      );
      expect(responseWithFilter.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByMaterialNestedResponseData.yearSum),
      );

      const responseWithGrandchildFilter = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'materialIds[]': [grandchildMaterial.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
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
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'region',
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

    test('Impact table grouped by Supplier should be successful', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });

      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
        nameCode: INDICATOR_TYPES.DEFORESTATION,
      });

      const material: Material = await createMaterial({
        name: 'Fake Material',
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
        material: material,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'supplier',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupBySupplierResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupBySupplierResponseData.yearSum),
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
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'business-unit',
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
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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
        locationType: LOCATION_TYPES.AGGREGATION_POINT,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'location-type',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByLocationTypeResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByLocationTypeResponseData.yearSum),
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
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'page[size]': 1,
          'page[number]': 1,
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
        })
        .expect(HttpStatus.OK);
      const responseSecondPage = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          'page[size]': 1,
          'page[number]': 2,
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
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
        groupByMaterialResponseData.rows[0].values[0].value,
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
        nameCode: INDICATOR_TYPES.DEFORESTATION,
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
        locationType: LOCATION_TYPES.AGGREGATION_POINT,
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
          sourcingLocation: sourcingLocation1,
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
          sourcingLocation: sourcingLocation2,
        });
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/table')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2013,
          startYear: 2010,
          groupBy: 'material',
          'locationTypes[]': [LOCATION_TYPES_PARAMS.AGGREGATION_POINT],
        });
      //.expect(HttpStatus.OK);

      expect(response.body.data.impactTable[0].rows).toHaveLength(1);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(filteredByLocationTypeResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(filteredByLocationTypeResponseData.yearSum),
      );
    });
  });

  describe('Impact Table including Scenario Tests', () => {
    test(
      'When I query a Impact Table' +
        'And I include a Scenario Id' +
        'Then I should see the elements included in that Scenario among the actual data',
      async () => {
        const {
          replacedMaterials,
          replacingMaterials,
          scenarioIntervention,
          indicator,
        } = await createNewMaterialInterventionPreconditions();

        const response = await request(app.getHttpServer())
          .get('/api/v1/impact/table')
          .set('Authorization', `Bearer ${jwtToken}`)
          .query({
            'indicatorIds[]': [indicator.id],
            endYear: 2022,
            startYear: 2019,
            groupBy: 'material',
            scenarioId: scenarioIntervention.scenarioId,
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
      },
    );
  });
});
