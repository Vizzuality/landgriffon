import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createAdminRegion,
  createBusinessUnit,
  createH3Data,
  createIndicator,
  createIndicatorRecord,
  createIndicatorRecordV2,
  createMaterial,
  createMaterialToH3,
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
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
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
  filteredByLocationTypeResponseData,
  groupByBusinessUnitResponseData,
  groupByLocationTypeResponseData,
  groupByMaterialNestedResponseData,
  groupByMaterialNestedResponseDataForGrandchild,
  groupByMaterialResponseData,
  groupByOriginResponseData,
  groupBySupplierResponseData,
} from './response-mocks.impact';
import { PaginationMeta } from '../../../src/utils/app-base.service';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from '../../../src/modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from '../../../src/modules/materials/materials-to-h3s.service';
import { clearEntityTables } from '../../utils/database-test-helper';
import { H3Data } from '../../../src/modules/h3-data/h3-data.entity';
import { range } from 'lodash';
import { SourcingRecord } from '../../../src/modules/sourcing-records/sourcing-record.entity';
import {
  ImpactTableDataAggregatedValue,
  ImpactTableDataAggregationInfo,
} from '../../../src/modules/impact/dto/response-impact-table.dto';

describe('Impact Table and Charts test suite (e2e)', () => {
  let app: INestApplication;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let businessUnitRepository: BusinessUnitRepository;
  let materialRepository: MaterialRepository;
  let materialToH3Service: MaterialsToH3sService;
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

    materialToH3Service = moduleFixture.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );

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
    await clearEntityTables([IndicatorRecord, MaterialToH3, H3Data, Material]);
    await materialToH3Service.delete({});
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
      'Available options: material,business_unit,region,supplier,location_type',
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

  describe('Ranking', () => {
    test('When I query the API for an Impact Table Ranking with an invalid sort order, a proper validation error should be returned', async () => {
      const invalidResponse = await request(app.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [uuidv4()],
          startYear: 2010,
          endYear: 2012,
          groupBy: 'material',
          maxRankingEntities: 420,
          sort: 'Condescending',
        })
        //ASSERT
        .expect(HttpStatus.BAD_REQUEST);

      //ASSERT
      expect(
        invalidResponse.body.errors[0].meta.rawError.response.message,
      ).toContain(
        `sort property must be either 'ASC' (Ascendant) or 'DES' (Descendent)`,
      );
    });

    test('When I query the API for an Impact Table Ranking with an invalid maxRankingEntities (missing or non positive), a proper validation error should be returned', async () => {
      // ARRANGE / ACT
      const missingResponse = await request(app.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [uuidv4()],
          startYear: 2010,
          groupBy: 'material',
        })
        //ASSERT
        .expect(HttpStatus.BAD_REQUEST);

      const nonPositivegResponse = await request(app.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [uuidv4()],
          startYear: 2010,
          groupBy: 'material',
          maxRankingEntities: 0,
        })
        //ASSERT
        .expect(HttpStatus.BAD_REQUEST);

      //ASSERT
      expect(
        missingResponse.body.errors[0].meta.rawError.response.message,
      ).toContain('maxRankingEntities should not be empty');
      expect(
        nonPositivegResponse.body.errors[0].meta.rawError.response.message,
      ).toContain('maxRankingEntities must be a positive number');
    });

    test('When I query the API for a Impact Table Ranking, then I should see all the data grouped by the requested entity and properly ordered, up to a MAX amount, with the rest being aggregated per year', async () => {
      //////////// ARRANGE
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
      });

      const indicator2: Indicator = await createIndicator({
        name: 'Fake Indicator 2',
        unit,
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });
      const supplierDescendant: Supplier = await createSupplier({
        name: 'Fake Supplier Descendant',
        parent: supplier,
      });

      // Create a small tree of Materials and their childs
      const numberOfTopMaterials = 4;
      const materialParents = await Promise.all(
        range(numberOfTopMaterials).map(
          async (index: number) =>
            await createMaterial({ name: `Fake Material ${index}` }),
        ),
      );
      for (const materialParent of materialParents) {
        materialParent.children = await Promise.all(
          range(2).map(
            async (index: number) =>
              await createMaterial({
                name: `${materialParent.name} - Child ${index}`,
                parent: materialParent,
              }),
          ),
        );
      }

      //Helper function to create sourcing location and related entities (indicator and sourcing records)
      //with behaviour specific to this test
      const buildSourcingLocation = async (
        material: Material,
        baseImpactValue: number,
        baseImpactValue2: number,
      ): Promise<SourcingLocation> => {
        const sourcingRecords: SourcingRecord[] = await Promise.all(
          range(2010, 2013).map(async (year: number) => {
            const sourcingRecord = await createSourcingRecord({
              year,
              tonnage: 100 + 10 * (year - 2010),
            });

            await createIndicatorRecordV2({
              indicator,
              value: baseImpactValue + 50 * (year - 2010),
              sourcingRecord,
            });

            await createIndicatorRecordV2({
              indicator: indicator2,
              value: baseImpactValue2 + 20 * (year - 2010),
              sourcingRecord,
            });

            return sourcingRecord;
          }),
        );

        return await createSourcingLocation({
          material: material,
          businessUnit,
          t1Supplier: supplierDescendant,
          adminRegion,
          sourcingRecords,
        });
      };

      const sourcingLocation0 = await buildSourcingLocation(
        materialParents[0],
        100,
        90,
      );
      const sourcingLocation00 = await buildSourcingLocation(
        materialParents[0].children[0],
        30,
        80,
      );
      const sourcingLocation10 = await buildSourcingLocation(
        materialParents[1].children[0],
        100,
        45,
      );
      const sourcingLocation11 = await buildSourcingLocation(
        materialParents[1].children[1],
        70,
        90,
      );
      const sourcingLocation20 = await buildSourcingLocation(
        materialParents[2].children[0],
        1000,
        200,
      );
      const sourcingLocation3 = await buildSourcingLocation(
        materialParents[3],
        40,
        500,
      );

      const maxRankingEntities = 2;

      //////////// ACT
      const response1 = await request(app.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id, indicator2.id],
          endYear: 2012,
          startYear: 2010,
          groupBy: 'material',
          maxRankingEntities: maxRankingEntities,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      //////////// ASSERT
      // Check aggregation for each indicator
      //Number of aggregated entities should be 2 because it's the top level entities, not counting children
      checkAggregatedInformation(
        response1.body.impactTable[0].others,
        numberOfTopMaterials - maxRankingEntities,
        [
          {
            value: 170,
            year: 2010,
          },
          {
            value: 320,
            year: 2011,
          },
          {
            value: 470,
            year: 2012,
          },
        ],
        'DES',
      );

      checkAggregatedInformation(
        response1.body.impactTable[1].others,
        numberOfTopMaterials - maxRankingEntities,
        [
          {
            value: 305,
            year: 2010,
          },
          {
            value: 385,
            year: 2011,
          },
          {
            value: 465,
            year: 2012,
          },
        ],
        'DES',
      );

      // Check that each indicator only has the expected number of maxRankingEntities and sorted appropriately
      expect(response1.body.impactTable[0].rows).toHaveLength(
        maxRankingEntities,
      );
      expect(response1.body.impactTable[1].rows).toHaveLength(
        maxRankingEntities,
      );

      //Check order and values of ranked entities  for each indicator
      //Inidicator1
      expect(response1.body.impactTable[0].rows[0].name).toEqual(
        materialParents[2].name,
      );
      expect(response1.body.impactTable[0].rows[1].name).toEqual(
        materialParents[1].name,
      );
      expect(response1.body.impactTable[0].rows[0].values[0]).toEqual({
        year: 2010,
        value: 1000,
        isProjected: false,
      });
      expect(response1.body.impactTable[0].rows[1].values[0]).toEqual({
        year: 2010,
        value: 170,
        isProjected: false,
      });

      //Inidicator2
      expect(response1.body.impactTable[1].rows[0].name).toEqual(
        materialParents[3].name,
      );
      expect(response1.body.impactTable[1].rows[1].name).toEqual(
        materialParents[2].name,
      );
      expect(response1.body.impactTable[1].rows[0].values[0]).toEqual({
        year: 2010,
        value: 500,
        isProjected: false,
      });
      expect(response1.body.impactTable[1].rows[1].values[0]).toEqual({
        year: 2010,
        value: 200,
        isProjected: false,
      });
    });

    test('When I query the API for a Impact Table Ranking, and there is not enough entities to exceed the maxRankingEntities, then the aggregated value and number of entities should be 0', async () => {
      //ARRANGE
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
      });

      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Fake Business Unit',
      });

      const supplier: Supplier = await createSupplier({
        name: 'Fake Supplier',
      });
      const supplierDescendant: Supplier = await createSupplier({
        name: 'Fake Supplier Descendant',
        parent: supplier,
      });

      const material = await createMaterial({ name: `Fake Material ` });

      const sourcingRecord = await createSourcingRecord({
        year: 2010,
        tonnage: 100,
      });

      await createIndicatorRecordV2({
        indicator,
        value: 50,
        sourcingRecord,
      });

      await createSourcingLocation({
        material: material,
        businessUnit,
        t1Supplier: supplierDescendant,
        adminRegion,
        sourcingRecords: [sourcingRecord],
      });

      const maxRankingEntities = 5;

      //ACT
      const response1 = await request(app.getHttpServer())
        .get('/api/v1/impact/ranking')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          'indicatorIds[]': [indicator.id],
          endYear: 2012,
          startYear: 2010,
          groupBy: 'material',
          maxRankingEntities: maxRankingEntities,
          sort: 'DES',
        })
        .expect(HttpStatus.OK);

      //ASSERT
      // Number of aggregated entities and aggregated value should be 0 because there's not enough entities
      // that result the current data/criteria that go over the maxRankingEntities
      checkAggregatedInformation(
        response1.body.impactTable[0].others,
        0,
        [
          {
            value: 0,
            year: 2010,
          },
          {
            value: 0,
            year: 2011,
          },
          {
            value: 0,
            year: 2012,
          },
        ],
        'DES',
      );

      // Check that each indicator has the expected number of entities
      expect(response1.body.impactTable[0].rows).toHaveLength(1);
    });

    function checkAggregatedInformation(
      others: ImpactTableDataAggregationInfo,
      numberAggregatedEntities: number,
      aggregatedValues: ImpactTableDataAggregatedValue[],
      sort: string,
    ): void {
      expect(others).toBeTruthy();
      expect(others.numberOfAggregatedEntities).toEqual(
        numberAggregatedEntities,
      );
      expect(others.aggregatedValues).toEqual(aggregatedValues);
      expect(others.sort).toEqual(sort);
    }
  });

  describe('Group By tests', () => {
    test('Impact table grouped by Material should be successful', async () => {
      const material: Material = await createMaterial({
        name: 'Fake Material',
      });

    test('When I query the API for a Impact table grouped by material Then I should get the correct data', async () => {
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

      // Creating Sourcing Records and Indicator Records for previously created Sourcing locations with different Materials
      for await (const [index, year] of [2010, 2011, 2012].entries()) {
        const startTonnage: number = 100;
        const fakeH3: H3Data = await createH3Data();
        const materialToH3: MaterialToH3 = await createMaterialToH3(
          material.id,
          fakeH3.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

        const indicatorRecord1: IndicatorRecord = await createIndicatorRecord({
          value: 1000 + index / 0.02,
          indicator,
          materialH3DataId: materialToH3.h3DataId,
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
          materialH3DataId: materialToH3.h3DataId,
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

      expect(response.body.data.impactTable[0].rows).toHaveLength(2);
      expect(response.body.data.impactTable[0].rows).toEqual(
        expect.arrayContaining(groupByMaterialResponseData.rows),
      );
      expect(response.body.data.impactTable[0].yearSum).toEqual(
        expect.arrayContaining(groupByMaterialResponseData.yearSum),
      );
    });

    test('When I query the API for a Impact table grouped by material Then I should get the correct data', async () => {
    test('Impact table grouped by Nested Materials should be successful', async () => {
      const material: Material = await createMaterial({
        name: 'Fake Material',
      });
      const fakeH3 = await createH3Data();
      const materiaLToH3 = await createMaterialToH3(
        material.id,
        fakeH3.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );
      const adminRegion: AdminRegion = await createAdminRegion({
        name: 'Fake AdminRegion',
      });
      const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
      const indicator: Indicator = await createIndicator({
        name: 'Fake Indicator',
        unit,
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
          materialH3DataId: materiaLToH3.h3DataId,
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
          materialH3DataId: materiaLToH3.h3DataId,
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
    test('Impact table grouped by Region should be successful', async () => {
      const material: Material = await createMaterial({
        name: 'Fake Material',
      });
      const fakeH3 = await createH3Data();
      const materiaLToH3 = await createMaterialToH3(
        material.id,
        fakeH3.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );
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
          materialH3DataId: materiaLToH3.h3DataId,
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
          materialH3DataId: materiaLToH3.h3DataId,
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
          'locationType[]': [LOCATION_TYPES_PARAMS.AGGREGATION_POINT],
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
});
