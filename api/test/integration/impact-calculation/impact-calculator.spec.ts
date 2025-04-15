import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import {
  createAdminRegion,
  createBusinessUnit,
  createGeoRegion,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';

import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from 'modules/indicator-records/indicator-record.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import {
  clearTestDataFromDatabase,
  dropH3GridTables,
} from '../../utils/database-test-helper';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { h3MaterialExampleDataFixture } from '../../e2e/h3-data/mocks/h3-fixtures';
import {
  dropH3DataMock,
  h3DataMock,
} from '../../e2e/h3-data/mocks/h3-data.mock';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
import { CachedDataRepository } from 'modules/cached-data/cached-data.repository';
import { DataSource, Repository } from 'typeorm';
import { ImpactCalculatorV2 } from 'modules/impact/calculation/impact.calculator';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { createWorldToCalculateImpactOfAllIndicators } from '../../utils/impact-calculation-preconditions';

describe('Impact Calculator Tests', () => {
  let dataSource: DataSource;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let indicatorRepository: IndicatorRepository;
  let h3DataRepository: H3DataRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let adminRegionRepository: AdminRegionRepository;
  let businessUnitRepository: BusinessUnitRepository;
  let supplierRepository: SupplierRepository;
  let geoRegionRepository: GeoRegionRepository;
  let materialRepository: MaterialRepository;
  let cachedDataRepository: CachedDataRepository;
  let sourcingLocationsRepository: SourcingLocationRepository;
  const repositories: Set<Repository<any>> = new Set();

  let impactCalculatorV2: ImpactCalculatorV2;
  let materialsToH3sService: MaterialsToH3sService;

  const deleteBetweenEach = async (): Promise<void> => {
    await indicatorRecordRepository.delete({});
    await indicatorRepository.delete({});
    await sourcingRecordRepository.delete({});
    await adminRegionRepository.delete({});
    await supplierRepository.delete({});
    await businessUnitRepository.delete({});
    await materialsToH3sService.delete({});
    await h3DataRepository.delete({});
    await geoRegionRepository.delete({});
    await materialRepository.delete({});
    await cachedDataRepository.delete({});
    await sourcingLocationsRepository.delete({});
  };

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorRecordsModule],
    }).compile();

    dataSource = testingModule.get<DataSource>(DataSource);

    indicatorRecordRepository = testingModule.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );
    repositories.add(indicatorRecordRepository);
    indicatorRepository =
      testingModule.get<IndicatorRepository>(IndicatorRepository);
    repositories.add(indicatorRepository);
    h3DataRepository = testingModule.get<H3DataRepository>(H3DataRepository);
    repositories.add(h3DataRepository);
    sourcingRecordRepository = testingModule.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
    repositories.add(sourcingRecordRepository);
    sourcingLocationsRepository = testingModule.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    repositories.add(sourcingLocationsRepository);
    adminRegionRepository = testingModule.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    repositories.add(adminRegionRepository);
    businessUnitRepository = testingModule.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    repositories.add(businessUnitRepository);
    supplierRepository =
      testingModule.get<SupplierRepository>(SupplierRepository);
    repositories.add(supplierRepository);
    geoRegionRepository =
      testingModule.get<GeoRegionRepository>(GeoRegionRepository);
    repositories.add(geoRegionRepository);
    materialRepository =
      testingModule.get<MaterialRepository>(MaterialRepository);
    repositories.add(materialRepository);
    cachedDataRepository =
      testingModule.get<CachedDataRepository>(CachedDataRepository);
    repositories.add(cachedDataRepository);

    impactCalculatorV2 =
      testingModule.get<ImpactCalculatorV2>(ImpactCalculatorV2);
    materialsToH3sService = testingModule.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );

    await deleteBetweenEach();
  });

  afterEach(async () => {
    //Delete all generated data
    await deleteBetweenEach();

    await dropH3GridTables(dataSource);

    await dropH3DataMock(dataSource, [
      'fake_material_table2002',
      'fake_material1_table2002',
      'fake_material2_table2002',
      'fake_material_table_harvest2002',
      'fake_material_table_producer2002',
    ]);
  });

  afterAll(async () => {
    return clearTestDataFromDatabase(dataSource);
  });

  describe('Impact createIndicatorRecordsBySourcingRecords', () => {
    // This test doesn't make sense for new methodology, since all the Indicators in DTO are optional
    test('When creating all indicators records for all indicators, it should create the indicator records properly', async () => {
      //ARRANGE;
      const indicatorPreconditions = await createPreconditions();

      const h3Material1 = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterial1Table2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const h3Material2 = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterial2Table2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const materialH3DataProducer1 = await createMaterialToH3(
        indicatorPreconditions.material1.id,
        h3Material1.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      await createMaterialToH3(
        indicatorPreconditions.material1.id,
        h3Material1.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );
      const materialH3DataProducer2 = await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material2.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material2.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      //ACT
      await impactCalculatorV2.calculateImpact([
        ...indicatorPreconditions.indicatorMap.values(),
      ]);

      //ASSERT
      const allIndicatorRecords = await indicatorRecordRepository.find();
      expect(allIndicatorRecords.length).toEqual(28);
      const indicatorMap: Map<INDICATOR_NAME_CODES, Indicator> =
        indicatorPreconditions.indicatorMap;

      const sourcingRecord1CheckValues: Record<INDICATOR_NAME_CODES, number[]> =
        {
          [INDICATOR_NAME_CODES.DF_SLUC]: [161.49068322981367, 1610],
          [INDICATOR_NAME_CODES.LF]: [1000, 1610],
          [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: [161.49068322981367, 1610],
          [INDICATOR_NAME_CODES.UWU]: [0, 1610],
          [INDICATOR_NAME_CODES.WW]: [0, 1610],
          [INDICATOR_NAME_CODES.WC]: [0, 1610],
          [INDICATOR_NAME_CODES.WGUWU]: [0, 1610],
          [INDICATOR_NAME_CODES.NL]: [0, 1610],
          [INDICATOR_NAME_CODES.ENL]: [0, 1610],
          [INDICATOR_NAME_CODES.NCE]: [161.49068322981367, 1610],
          [INDICATOR_NAME_CODES.FLIL]: [161.49068322981367, 1610],
          [INDICATOR_NAME_CODES.GHG_FARM]: [0, 1610],
          [INDICATOR_NAME_CODES.WU]: [0, 1610],
          [INDICATOR_NAME_CODES.WGSWU_NEW]: [0, 1610],
        };

      const sourcingRecord2CheckValues: Record<INDICATOR_NAME_CODES, number[]> =
        {
          [INDICATOR_NAME_CODES.DF_SLUC]: [80.74534161490683, 1610],
          [INDICATOR_NAME_CODES.LF]: [500, 1610],
          [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: [80.74534161490683, 1610],
          [INDICATOR_NAME_CODES.UWU]: [0, 1610],
          [INDICATOR_NAME_CODES.WW]: [0, 1610],
          [INDICATOR_NAME_CODES.WC]: [0, 1610],
          [INDICATOR_NAME_CODES.WGUWU]: [0, 1610],
          [INDICATOR_NAME_CODES.NL]: [0, 1610],
          [INDICATOR_NAME_CODES.ENL]: [0, 1610],
          [INDICATOR_NAME_CODES.NCE]: [80.74534161490683, 1610],
          [INDICATOR_NAME_CODES.FLIL]: [80.74534161490683, 1610],
          [INDICATOR_NAME_CODES.GHG_FARM]: [0, 1610],
          [INDICATOR_NAME_CODES.WU]: [0, 1610],
          [INDICATOR_NAME_CODES.WGSWU_NEW]: [0, 1610],
        };

      for (const [nameCode, values] of Object.entries(
        sourcingRecord1CheckValues,
      )) {
        await checkCreatedIndicatorRecord(
          indicatorMap.get(nameCode as INDICATOR_NAME_CODES)!,
          materialH3DataProducer1,
          indicatorPreconditions.sourcingRecord1.id,
          values[0],
          values[1],
        );
      }

      for (const [nameCode, values] of Object.entries(
        sourcingRecord2CheckValues,
      )) {
        await checkCreatedIndicatorRecord(
          indicatorMap.get(nameCode as INDICATOR_NAME_CODES)!,
          materialH3DataProducer2,
          indicatorPreconditions.sourcingRecord2.id,
          values[0],
          values[1],
        );
      }
    });
  });

  /**
   * Does expect checks on all relevant fields of IndicatorRecord
   */
  async function checkCreatedIndicatorRecord(
    indicator: Indicator,
    materialH3Data: MaterialToH3,
    sourcingRecordId: string,
    recordValue: number,
    scalerValue: number | null,
    calculatedIndicatorRecords?: IndicatorRecord[],
  ): Promise<void> {
    let createdRecords: IndicatorRecord[];

    if (calculatedIndicatorRecords?.length) {
      createdRecords = calculatedIndicatorRecords.filter(
        (record: IndicatorRecord) =>
          record.indicatorId === indicator.id &&
          record.sourcingRecordId === sourcingRecordId,
      );
    } else {
      createdRecords = await indicatorRecordRepository.find({
        where: { indicatorId: indicator.id, sourcingRecordId },
      });
    }

    expect(createdRecords.length).toEqual(1);
    expect(createdRecords[0].sourcingRecordId).toEqual(sourcingRecordId);
    expect(createdRecords[0].status).toEqual(INDICATOR_RECORD_STATUS.SUCCESS);
    expect(createdRecords[0].value).toEqual(recordValue);
    expect(createdRecords[0].scaler).toEqual(scalerValue);
    expect(createdRecords[0].materialH3DataId).toEqual(materialH3Data.h3DataId);
    //Inidicator Coefficients are not checked because it's not used
  }

  async function createPreconditions(): Promise<any> {
    const material1: Material = await createMaterial({ name: 'Vibranium' });
    const supplier1: Supplier = await createSupplier({
      name: 'Stark Industries',
    });
    const geoRegion1: GeoRegion = await createGeoRegion({
      name: 'geoRegion1',
      h3Compact: [
        '861080007ffffff',
        '861080017ffffff',
        '86108001fffffff',
        '861080027ffffff',
        '86108002fffffff',

        '8610b6d97ffffff',
        '8610b6d9fffffff',
        '8610b6da7ffffff',
        '8610b6dafffffff',
        '8610b6db7ffffff',
      ],
      h3Flat: [
        '861080007ffffff',
        '861080017ffffff',
        '86108001fffffff',
        '861080027ffffff',
        '86108002fffffff',

        '8610b6d97ffffff',
        '8610b6d9fffffff',
        '8610b6da7ffffff',
        '8610b6dafffffff',
        '8610b6db7ffffff',
      ],
      h3FlatLength: 10,
    });
    const adminRegion1: AdminRegion = await createAdminRegion({
      name: 'USA',
      geoRegionId: geoRegion1.id,
    });
    const businessUnit1: BusinessUnit = await createBusinessUnit({
      name: 'businessUnit2',
    });
    const sourcingLocation1: SourcingLocation = await createSourcingLocation({
      materialId: material1.id,
      t1SupplierId: supplier1.id,
      businessUnitId: businessUnit1.id,
      adminRegionId: adminRegion1.id,
      geoRegionId: geoRegion1.id,
    });

    const material2: Material = await createMaterial({
      name: 'Dilithium',
    });
    const supplier2: Supplier = await createSupplier({ name: 'Starfleet' });
    const geoRegion2: GeoRegion = await createGeoRegion({
      name: 'geoRegion2',
      h3Compact: [
        '861080007ffffff',
        '861080017ffffff',
        '86108001fffffff',
        '861080027ffffff',
        '86108002fffffff',

        '8610b6d97ffffff',
        '8610b6d9fffffff',
        '8610b6da7ffffff',
        '8610b6dafffffff',
        '8610b6db7ffffff',
      ],
      h3Flat: [
        '861080007ffffff',
        '861080017ffffff',
        '86108001fffffff',
        '861080027ffffff',
        '86108002fffffff',

        '8610b6d97ffffff',
        '8610b6d9fffffff',
        '8610b6da7ffffff',
        '8610b6dafffffff',
        '8610b6db7ffffff',
      ],
      h3FlatLength: 10,
    });
    const adminRegion2: AdminRegion = await createAdminRegion({
      name: 'Sector 001',
      geoRegionId: geoRegion2.id,
    });
    const businessUnit2: BusinessUnit = await createBusinessUnit({
      name: 'businessUnit2',
    });

    const sourcingRecord1 = await createSourcingRecord({
      sourcingLocationId: sourcingLocation1.id,
      year: 2018,
      tonnage: 1000,
    });

    const sourcingLocation2: SourcingLocation = await createSourcingLocation({
      materialId: material2.id,
      t1SupplierId: supplier2.id,
      businessUnitId: businessUnit2.id,
      adminRegionId: adminRegion2.id,
      geoRegionId: geoRegion2.id,
    });

    const sourcingRecord2 = await createSourcingRecord({
      sourcingLocationId: sourcingLocation2.id,
      year: 2018,
      tonnage: 500,
    });

    const h3Data = await createWorldToCalculateImpactOfAllIndicators(
      dataSource,
    );

    const tablesToDrop = [...h3Data.h3DataMap.values()].map(
      (h3Data: H3Data) => h3Data.h3tableName,
    );

    return {
      material1,
      material2,
      supplier1,
      supplier2,
      geoRegion1,
      geoRegion2,
      adminRegion1,
      adminRegion2,
      businessUnit1,
      businessUnit2,
      sourcingLocation1,
      sourcingLocation2,
      sourcingRecord1,
      sourcingRecord2,
      indicatorMap: h3Data.indicatorMap,
      h3DataMap: h3Data.h3DataMap,
      tablesToDrop,
    };
  }
});
