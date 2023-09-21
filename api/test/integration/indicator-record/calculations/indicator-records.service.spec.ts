import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { CachedRawValue } from 'modules/indicator-records/indicator-records.service';
import {
  createAdminRegion,
  createBusinessUnit,
  createGeoRegion,
  createH3Data,
  createIndicatorRecord,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../../entity-mocks';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';

import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from 'modules/indicator-records/indicator-record.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { createWorldToCalculateIndicatorRecords } from '../../../utils/indicator-records-preconditions';
import { v4 as UUIDv4 } from 'uuid';
import { H3Data } from 'modules/h3-data/entities/h3-data.entity';
import {
  clearTestDataFromDatabase,
  dropH3GridTables,
} from '../../../utils/database-test-helper';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { h3MaterialExampleDataFixture } from '../../../e2e/h3-data/mocks/h3-fixtures';
import {
  dropH3DataMock,
  h3DataMock,
} from '../../../e2e/h3-data/mocks/h3-data.mock';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import {
  CACHED_DATA_TYPE,
  CachedData,
} from 'modules/cached-data/cached-data.entity';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
import { CachedDataRepository } from 'modules/cached-data/cached-data.repository';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import { DataSource } from 'typeorm';

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

  let impactCalculator: ImpactCalculator;
  let materialsToH3sService: MaterialsToH3sService;
  let cachedDataService: CachedDataService;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorRecordsModule],
    }).compile();

    dataSource = testingModule.get<DataSource>(DataSource);

    indicatorRecordRepository = testingModule.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );
    indicatorRepository =
      testingModule.get<IndicatorRepository>(IndicatorRepository);
    h3DataRepository = testingModule.get<H3DataRepository>(H3DataRepository);
    sourcingRecordRepository = testingModule.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
    adminRegionRepository = testingModule.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    businessUnitRepository = testingModule.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    supplierRepository =
      testingModule.get<SupplierRepository>(SupplierRepository);
    geoRegionRepository =
      testingModule.get<GeoRegionRepository>(GeoRegionRepository);
    materialRepository =
      testingModule.get<MaterialRepository>(MaterialRepository);
    cachedDataRepository =
      testingModule.get<CachedDataRepository>(CachedDataRepository);

    impactCalculator = testingModule.get<ImpactCalculator>(ImpactCalculator);
    materialsToH3sService = testingModule.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    cachedDataService = testingModule.get<CachedDataService>(CachedDataService);
  });

  afterEach(async () => {
    //Delete all generated data
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
    test.skip('When creating Indicator Records providing indicator coefficients, and one of the indicator coefficients is missing on the DTO, it should throw error', async () => {
      // ARRANGE
      const indicatorPreconditions = await createPreconditions();
      const fakeH3Data = await createH3Data();
      await createMaterialToH3(
        indicatorPreconditions.material1.id,
        fakeH3Data.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      const fakeIndicatorRecordForScaler: IndicatorRecord =
        await createIndicatorRecord();

      indicatorPreconditions.sourcingRecord1.indicatorRecords = [
        fakeIndicatorRecordForScaler,
      ];

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord1.id,
        tonnage: indicatorPreconditions.sourcingRecord1.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation1.geoRegionId,
        adminRegionId: indicatorPreconditions.sourcingLocation1.adminRegionId,
        materialId: indicatorPreconditions.sourcingLocation1.materialId,
        year: indicatorPreconditions.sourcingRecord1.year,
        sourcingRecord: indicatorPreconditions.sourcingRecord1,
      };

      const providedCoefficients: IndicatorCoefficientsDto = {
        [INDICATOR_NAME_CODES.WATER_USE]: 0.1,
        [INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE]: 0.4,
        [INDICATOR_NAME_CODES.DEFORESTATION_RISK]: 0.35,
        ...({} as any),
      };

      //ACT
      const testStatement = async (): Promise<any> => {
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
          providedCoefficients,
        );
      };

      //ASSERT
      //await expect(testStatement).rejects.toThrow(NotFoundException);
      await expect(testStatement).rejects.toThrow(
        `Required coefficient for indicator ${INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE} was not provided`,
      );
    });

    test('When creating Indicator Records providing indicator coefficients, it should create the records properly', async () => {
      // ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const h3Material = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterialTable2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });

      const materialH3Data = await createMaterialToH3(
        indicatorPreconditions.material1.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      await createMaterialToH3(
        indicatorPreconditions.material1.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord1.id,
        tonnage: indicatorPreconditions.sourcingRecord1.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation1.geoRegionId,
        adminRegionId: indicatorPreconditions.sourcingLocation1.adminRegionId,
        materialId: indicatorPreconditions.sourcingLocation1.materialId,
        year: indicatorPreconditions.sourcingRecord1.year,
        sourcingRecord: indicatorPreconditions.sourcingRecord1,
      };

      const providedCoefficients: IndicatorCoefficientsDto = {
        [INDICATOR_NAME_CODES.CLIMATE_RISK]: 0.1,
        [INDICATOR_NAME_CODES.DEFORESTATION_RISK]: 0.4,
        [INDICATOR_NAME_CODES.LAND_USE]: 0.35,
        [INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE]: 0.2,
        [INDICATOR_NAME_CODES.WATER_USE]: 0.6,
        [INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION]: 0.3,
        [INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION_RISK]: 0.5,
        [INDICATOR_NAME_CODES.NATURAL_ECOSYSTEM_CONVERSION_RISK]: 0.7,
        [INDICATOR_NAME_CODES.WATER_QUALITY]: 0.8,
      };

      //ACT
      const calculatedIndicators =
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
          providedCoefficients,
        );

      //ASSERT

      expect(calculatedIndicators.length).toEqual(5);

      // Value is provided coeff * tonnage, and scaler is null, because it's based on production coefficient, and it's not provided
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.deforestationIndicator,
        materialH3Data,
        sourcingData.sourcingRecordId,
        400,
        1610,
        calculatedIndicators,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.climateRiskIndicator,
        materialH3Data,
        sourcingData.sourcingRecordId,
        100,
        1610,
        calculatedIndicators,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.landUseIndicator,
        materialH3Data,
        sourcingData.sourcingRecordId,
        350,
        1610,
        calculatedIndicators,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.unsustWaterUseIndicator,
        materialH3Data,
        sourcingData.sourcingRecordId,
        120000,
        1610,
        calculatedIndicators,
      );

      await checkCreatedIndicatorRecord(
        indicatorPreconditions.waterUseIndicator,
        materialH3Data,
        sourcingData.sourcingRecordId,
        600,
        1610,
        calculatedIndicators,
      );
    });

    test("When creating indicator record with no provided coefficients, and there's no H3 data for the given material, it should throw an error", async () => {
      //ARRANGE

      const randomSourcingRecord: SourcingRecord = await createSourcingRecord();
      const sourcingData = {
        sourcingRecordId: UUIDv4(),
        geoRegionId: UUIDv4(),
        adminRegionId: UUIDv4(),
        materialId: UUIDv4(),
        tonnage: 10000,
        year: 2010,
        sourcingRecord: randomSourcingRecord,
      };

      jest.spyOn(materialsToH3sService, 'findOne').mockResolvedValueOnce(null);

      const testStatement = async (): Promise<any> => {
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );
      };

      //ACT/ASSERT
      await expect(testStatement).rejects.toThrow(MissingH3DataError);
      // await expect(testStatement).rejects.toThrow(
      //   `No H3 Data required to calculate Impact for Material with ID: ${sourcingData.materialId}`,
      // );
    });

    test('When creating Indicator Records without providing indicator coefficients, and one of the Material H3 is not available for any year, it should throw error', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        adminRegionId: indicatorPreconditions.sourcingLocation2.adminRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
        sourcingRecord: indicatorPreconditions.sourcingRecord2,
      };

      const h3Material = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterialTable2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      //ACT
      const testStatement = async (): Promise<any> => {
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );
      };

      //ASSERT
      await expect(testStatement).rejects.toThrow(ServiceUnavailableException);
      await expect(testStatement).rejects.toThrow(
        `Could not calculate Raw Indicator values for new Scenario`,
      );
    });

    // Check if this test makes sense for new methodology
    test.skip('When creating Indicator Records without providing indicator coefficients, and one of the Indicator H3 is not available for any year, it should throw error', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const fakeIndicatorRecordForScaler: IndicatorRecord =
        await createIndicatorRecord();
      indicatorPreconditions.sourcingRecord2.indicatorRecords = [
        fakeIndicatorRecordForScaler,
      ];

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        adminRegionId: indicatorPreconditions.sourcingLocation2.adminRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
        sourcingRecord: indicatorPreconditions.sourcingRecord2,
      };

      const h3Material = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterialTable2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      await h3DataRepository.delete({
        id: indicatorPreconditions.deforestation.id,
      });

      //ACT
      const testStatement = async (): Promise<any> => {
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );
      };

      //ASSERT
      await expect(testStatement).rejects.toThrow(NotFoundException);
      await expect(testStatement).rejects.toThrow(
        `H3 Data of required Indicator of type ${INDICATOR_NAME_CODES.DEFORESTATION_RISK} missing for ${INDICATOR_NAME_CODES.DEFORESTATION_RISK} Indicator Record value calculations`,
      );
    });

    test('When creating indicators without provided coefficients and the material has H3 data, it should create the indicator records properly', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        adminRegionId: indicatorPreconditions.sourcingLocation2.adminRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
        sourcingRecord: indicatorPreconditions.sourcingRecord2,
      };

      const h3Material = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterialTable2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const materialH3DataProducer = await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      const calculatedRecords =
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );

      //ASSERT
      // const allIndicators = await indicatorRecordRepository.find();
      expect(calculatedRecords.length).toEqual(5);

      await checkCreatedIndicatorRecord(
        indicatorPreconditions.deforestationIndicator,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        80.74534161490683,
        1610,
        calculatedRecords,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.climateRiskIndicator,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        80.74534161490683,
        1610,
        calculatedRecords,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.landUseIndicator,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        500,
        1610,
        calculatedRecords,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.unsustWaterUseIndicator,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        0,
        1610,
        calculatedRecords,
      );
    });
    // TODO: Restore when new methodology validated
    test('When creating all indicators records, it should create the indicator records properly', async () => {
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

      await impactCalculator.calculateImpactForAllSourcingRecords([
        indicatorPreconditions.waterUseIndicator,
        indicatorPreconditions.unsustWaterUseIndicator,
        indicatorPreconditions.climateRiskIndicator,
        indicatorPreconditions.landUseIndicator,
        indicatorPreconditions.deforestationIndicator,
      ]);

      //ASSERT
      const allIndicators = await indicatorRecordRepository.find();
      expect(allIndicators.length).toEqual(10);

      await checkCreatedIndicatorRecord(
        indicatorPreconditions.deforestationIndicator,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        161.49068322981367,
        1610,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.landUseIndicator,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        1000,
        1610,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.climateRiskIndicator,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        161.49068322981367,
        1610,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.unsustWaterUseIndicator,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        0,
        1610,
      );

      await checkCreatedIndicatorRecord(
        indicatorPreconditions.deforestationIndicator,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        80.74534161490683,
        1610,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.landUseIndicator,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        500,
        1610,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.climateRiskIndicator,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        80.74534161490683,
        1610,
      );
      await checkCreatedIndicatorRecord(
        indicatorPreconditions.unsustWaterUseIndicator,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        0,
        1610,
      );
    });

    test.skip("When creating indicators without provided coefficients and the material has H3 data, the raw values for the calculations should be read from the cache if they're already present on the CachedData", async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        adminRegionId: indicatorPreconditions.sourcingLocation2.adminRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
        sourcingRecord: indicatorPreconditions.sourcingRecord2,
      };

      const h3MaterialProducer = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterialTableProducer2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const h3MaterialHarvest = await h3DataMock(dataSource, {
        h3TableName: 'fakeMaterialTableHarvest2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3MaterialProducer.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3MaterialHarvest.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      //Small "hack" to access the method to simplify part of the cache key
      const indicatorRecordServiceAny: any = impactCalculator;
      const generateIndicatorCacheKey: any =
        indicatorRecordServiceAny.generateIndicatorCalculationCacheKey;
      const generateMaterialCacheKey: any =
        indicatorRecordServiceAny.generateMaterialCalculationCacheKey;

      //Prepare Cache Data
      const bioMap: Map<INDICATOR_NAME_CODES, H3Data> = new Map();
      bioMap.set(
        INDICATOR_NAME_CODES.LAND_USE,
        indicatorPreconditions.biodiversityLoss,
      );
      bioMap.set(
        INDICATOR_NAME_CODES.DEFORESTATION_RISK,
        indicatorPreconditions.deforestation,
      );
      const materialsMap: Map<MATERIAL_TO_H3_TYPE, H3Data> = new Map();
      materialsMap.set(MATERIAL_TO_H3_TYPE.HARVEST, h3MaterialHarvest);
      materialsMap.set(MATERIAL_TO_H3_TYPE.PRODUCER, h3MaterialProducer);

      const bioCacheKey: any = generateIndicatorCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        INDICATOR_NAME_CODES.LAND_USE,
        bioMap,
        materialsMap,
      );
      const materialHarvestKey: any = generateMaterialCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        h3MaterialHarvest,
      );
      const materialProducerKey: any = generateMaterialCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        h3MaterialProducer,
      );
      await cachedDataService.createCachedData(
        bioCacheKey,
        { rawValue: 450 } as CachedRawValue,
        CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      );
      await cachedDataService.createCachedData(
        materialHarvestKey,
        { rawValue: 75 } as CachedRawValue,
        CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      );
      await cachedDataService.createCachedData(
        materialProducerKey,
        { rawValue: 200 } as CachedRawValue,
        CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      );

      //ACT
      const calculatedRecords =
        await impactCalculator.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );

      //ASSERT
      //const allIndicators = await indicatorRecordRepository.find();
      expect(calculatedRecords.length).toEqual(4);

      // await checkCreatedIndicatorRecord(
      //   INDICATOR_TYPES.BIODIVERSITY_LOSS,
      //   indicatorPreconditions.biodiversityLoss,
      //   materialH3DataHarvest,
      //   sourcingData.sourcingRecordId,
      //   1125,
      //   200,
      //   calculatedRecords,
      // );
    });

    test.skip('When creating indicators without provided coefficients and the raws values are not cached, the raw values for the calculations should be cached after the execution', async () => {
      //ARRANGE
      // const indicatorPreconditions = await createPreconditions();
      //
      // const sourcingData = {
      //   sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
      //   tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
      //   geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   adminRegionId: indicatorPreconditions.sourcingLocation2.adminRegionId,
      //   materialId: indicatorPreconditions.sourcingLocation2.materialId,
      //   year: indicatorPreconditions.sourcingRecord2.year,
      //   sourcingRecord: indicatorPreconditions.sourcingRecord2,
      // };
      //
      // const h3MaterialHarvest = await h3DataMock(dataSource, {
      //   h3TableName: 'fakeMaterialTableHarvest2002',
      //   h3ColumnName: 'fakeMaterialColumn2002',
      //   additionalH3Data: h3MaterialExampleDataFixture,
      //   year: 2002,
      // });
      // const h3MaterialProducer = await h3DataMock(dataSource, {
      //   h3TableName: 'fakeMaterialTableProducer2002',
      //   h3ColumnName: 'fakeMaterialColumn2002',
      //   additionalH3Data: h3MaterialExampleDataFixture,
      //   year: 2002,
      // });
      // await createMaterialToH3(
      //   indicatorPreconditions.material2.id,
      //   h3MaterialProducer.id,
      //   MATERIAL_TO_H3_TYPE.PRODUCER,
      // );
      // await createMaterialToH3(
      //   indicatorPreconditions.material2.id,
      //   h3MaterialHarvest.id,
      //   MATERIAL_TO_H3_TYPE.HARVEST,
      // );
      //
      // // Prepare cached data
      // const bioMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      // bioMap.set(
      //   INDICATOR_TYPES.BIODIVERSITY_LOSS,
      //   indicatorPreconditions.biodiversityLoss,
      // );
      // bioMap.set(
      //   INDICATOR_TYPES.DEFORESTATION,
      //   indicatorPreconditions.deforestation,
      // );
      // const defMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      // defMap.set(
      //   INDICATOR_TYPES.DEFORESTATION,
      //   indicatorPreconditions.deforestation,
      // );
      // const carbonMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      // carbonMap.set(
      //   INDICATOR_TYPES.CARBON_EMISSIONS,
      //   indicatorPreconditions.carbonEmissions,
      // );
      // carbonMap.set(
      //   INDICATOR_TYPES.DEFORESTATION,
      //   indicatorPreconditions.deforestation,
      // );
      // const waterMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      // waterMap.set(
      //   INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      //   indicatorPreconditions.waterRisk,
      // );
      //
      // const materialsMap: Map<MATERIAL_TO_H3_TYPE, H3Data> = new Map();
      // materialsMap.set(MATERIAL_TO_H3_TYPE.HARVEST, h3MaterialHarvest);
      // materialsMap.set(MATERIAL_TO_H3_TYPE.PRODUCER, h3MaterialProducer);
      //
      // //Small "hack" to access the method to simplify part of the cache key
      // const indicatorRecordServiceAny: any = impactCalculator;
      // const generateIndicatorCacheKey: any =
      //   indicatorRecordServiceAny.generateIndicatorCalculationCacheKey;
      // const generateMaterialCacheKey: any =
      //   indicatorRecordServiceAny.generateMaterialCalculationCacheKey;
      //
      // const bioCacheKey: any = generateIndicatorCacheKey(
      //   indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   INDICATOR_TYPES.BIODIVERSITY_LOSS,
      //   bioMap,
      //   materialsMap,
      // );
      // const carbonCacheKey: any = generateIndicatorCacheKey(
      //   indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   INDICATOR_TYPES.CARBON_EMISSIONS,
      //   carbonMap,
      //   materialsMap,
      // );
      // const defCacheKey: any = generateIndicatorCacheKey(
      //   indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   INDICATOR_TYPES.DEFORESTATION,
      //   defMap,
      //   materialsMap,
      // );
      // const waterCacheKey: any = generateIndicatorCacheKey(
      //   indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      //   waterMap,
      //   materialsMap,
      // );
      // const materialHarvestKey: any = generateMaterialCacheKey(
      //   indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   h3MaterialHarvest,
      // );
      // const materialProdKey: any = generateMaterialCacheKey(
      //   indicatorPreconditions.sourcingLocation2.geoRegionId,
      //   h3MaterialProducer,
      // );
      //
      // //ACT
      // await impactCalculator.createIndicatorRecordsBySourcingRecords(
      //   sourcingData,
      // );
      //
      // //ASSERT
      //
      // await checkCachedData(
      //   bioCacheKey,
      //   479600.00187158585,
      //   CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      // );
      // await checkCachedData(
      //   carbonCacheKey,
      //   47.96,
      //   CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      // );
      // await checkCachedData(
      //   defCacheKey,
      //   260,
      //   CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      // );
      // await checkCachedData(
      //   waterCacheKey,
      //   0.00015400000363588332,
      //   CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      // );
      // await checkCachedData(
      //   materialProdKey,
      //   1610,
      //   CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      // );
      // await checkCachedData(
      //   materialHarvestKey,
      //   1610,
      //   CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      // );
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

  /**
   * Does expect checks on CachedDatas related to indicator and material calculations.
   * Intended for CachedDatas of
   * @param cacheKey
   * @param value
   * @param type
   */
  async function checkCachedData(
    cacheKey: any,
    value: number,
    type: CACHED_DATA_TYPE,
  ): Promise<void> {
    const cachedData: CachedData | null =
      await cachedDataService.getCachedDataByKey(cacheKey, type);

    expect(cachedData).toBeDefined();
    expect(cachedData?.data).toBeDefined();
    expect(cachedData?.type).toEqual(type);
    expect((cachedData?.data as CachedRawValue).rawValue).toEqual(value);
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

    const sourcingLocation1: SourcingLocation = await createSourcingLocation({
      materialId: material1.id,
      t1SupplierId: supplier1.id,
      businessUnitId: businessUnit1.id,
      adminRegionId: adminRegion1.id,
      geoRegionId: geoRegion1.id,
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

    const h3Data = await createWorldToCalculateIndicatorRecords(dataSource);

    const climateRiskIndicator = h3Data.indicators.find(
      (el: Indicator) => el.nameCode === INDICATOR_NAME_CODES.CLIMATE_RISK,
    );
    const landUseIndicator = h3Data.indicators.find(
      (el: Indicator) => el.nameCode === INDICATOR_NAME_CODES.LAND_USE,
    );

    const deforestationIndicator = h3Data.indicators.find(
      (el: Indicator) =>
        el.nameCode === INDICATOR_NAME_CODES.DEFORESTATION_RISK,
    );

    const waterUseIndicator = h3Data.indicators.find(
      (el: Indicator) => el.nameCode === INDICATOR_NAME_CODES.WATER_USE,
    );
    const unsustWaterUseIndicator = h3Data.indicators.find(
      (el: Indicator) =>
        el.nameCode === INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE,
    );
    const satelligenceDeforestation = h3Data.indicators.find(
      (el: Indicator) =>
        el.nameCode === INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION,
    );
    const satelligenceDeforestationRisk = h3Data.indicators.find(
      (el: Indicator) =>
        el.nameCode === INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION_RISK,
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
      climateRiskIndicator,
      landUseIndicator,
      deforestationIndicator,
      waterUseIndicator,
      unsustWaterUseIndicator,
      satelligenceDeforestation,
      satelligenceDeforestationRisk,
      tablesToDrop: h3Data.tablesToDrop,
    };
  }
});
