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
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { ImpactModule } from 'modules/impact/impact.module';
import { Unit } from 'modules/units/unit.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material } from 'modules/materials/material.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { UnitRepository } from 'modules/units/unit.repository';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import {
  groupByBusinessUnitResponseData,
  groupByMaterialResponseData,
  groupByOriginResponseData,
  groupBySupplierResponseData,
} from './response-mocks.impact';

describe('Impact Table and Charts test suite (e2e)', () => {
  let app: INestApplication;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let businessUnitRepository: BusinessUnitRepository;
  let materialRepository: MaterialRepository;
  let supplierRepository: SupplierRepository;
  let adminRegionRepository: AdminRegionRepository;
  let geoRegionRepository: GeoRegionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let indicatorRepository: IndicatorRepository;
  let sourcingLocationGroupRepository: SourcingLocationGroupRepository;
  let unitRepositoruy: UnitRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImpactModule],
    }).compile();

    unitRepositoruy = moduleFixture.get<UnitRepository>(UnitRepository);

    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );
    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
    sourcingLocationGroupRepository =
      moduleFixture.get<SourcingLocationGroupRepository>(
        SourcingLocationGroupRepository,
      );
    geoRegionRepository =
      moduleFixture.get<GeoRegionRepository>(GeoRegionRepository);
    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );
    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await materialRepository.delete({});
    await indicatorRepository.delete({});
    await unitRepositoruy.delete({});
    await businessUnitRepository.delete({});
    await adminRegionRepository.delete({});
    await geoRegionRepository.delete({});
    await supplierRepository.delete({});
    await indicatorRecordRepository.delete({});
    await sourcingRecordRepository.delete({});
    await sourcingLocationRepository.delete({});
    await sourcingLocationGroupRepository.delete({});
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
      'Available options: material,business_unit,region,supplier',
      'groupBy should not be empty',
      'groupBy must be a string',
    ]);
  });

  test('When I query the API for a Impact Table with correct params but there are not indicators to retrieve in the DB, then I should get a proper erros message ', async () => {
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
    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'Fake AdminRegion',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
    });

    const material: Material = await createMaterial({ name: 'Fake Material' });
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
      })
      .expect(HttpStatus.OK);

    expect(response1.body.data.impactTable[0].rows[0].name).toEqual(
      material.name,
    );

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
    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'Fake AdminRegion',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
    });

    const material: Material = await createMaterial({ name: 'Fake Material' });
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
    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'Fake AdminRegion',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Fake Indicator',
      unit,
    });

    const material: Material = await createMaterial({ name: 'Fake Material' });
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
    test('Impact table grouped by Material should be successful', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
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

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 1000 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord],
          sourcingLocation: sourcingLocation1,
        });
      }

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 1000;
        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 2000 + index / 0.02,
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

    test('Impact table grouped by Region should be successful', async () => {
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

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 600 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord],
          sourcingLocation: sourcingLocation1,
        });
      }

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 1000;
        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 500 + index / 0.02,
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

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 100 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord],
          sourcingLocation: sourcingLocation1,
        });
      }

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 1000;
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

    test('Impact table grouped by Business Unit should be successful', async () => {
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });

      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
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

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
          value: 100 + index / 0.02,
          indicator,
        });

        await createSourcingRecord({
          tonnage: startTonnage + 100 * index,
          year,
          indicatorRecords: [indicatorRecord],
          sourcingLocation: sourcingLocation1,
        });
      }

      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 1000;
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
  });
});
