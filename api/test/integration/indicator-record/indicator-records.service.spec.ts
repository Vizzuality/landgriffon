import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import {
  CachedRawValue,
  IndicatorRecordsService,
} from 'modules/indicator-records/indicator-records.service';
import {
  createAdminRegion,
  createBusinessUnit,
  createGeoRegion,
  createH3Data,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
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
import { createWorldToCalculateIndicatorRecords } from '../../utils/indicator-records-preconditions';
import { v4 as UUIDv4 } from 'uuid';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { dropH3GridTables } from '../../utils/database-test-helper';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from '../../../src/modules/materials/material-to-h3.entity';
import { h3MaterialExampleDataFixture } from '../../e2e/h3-data/mocks/h3-fixtures';
import {
  dropH3DataMock,
  h3DataMock,
} from '../../e2e/h3-data/mocks/h3-data.mock';
import { NotFoundException } from '@nestjs/common';
import { CachedDataService } from '../../../src/modules/cached-data/cached-data.service';
import {
  CACHED_DATA_TYPE,
  CachedData,
} from '../../../src/modules/cached-data/cached.data.entity';
import { IndicatorRepository } from '../../../src/modules/indicators/indicator.repository';
import { SourcingRecordRepository } from '../../../src/modules/sourcing-records/sourcing-record.repository';
import { AdminRegionRepository } from '../../../src/modules/admin-regions/admin-region.repository';
import { BusinessUnitRepository } from '../../../src/modules/business-units/business-unit.repository';
import { SupplierRepository } from '../../../src/modules/suppliers/supplier.repository';
import { GeoRegionRepository } from '../../../src/modules/geo-regions/geo-region.repository';
import { MaterialRepository } from '../../../src/modules/materials/material.repository';
import { CachedDataRepository } from '../../../src/modules/cached-data/cached-data.repository';

describe('Indicator Records Service', () => {
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

  let indicatorRecordService: IndicatorRecordsService;
  let materialsToH3sService: MaterialsToH3sService;
  let cachedDataService: CachedDataService;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorRecordsModule],
    }).compile();

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

    indicatorRecordService = testingModule.get<IndicatorRecordsService>(
      IndicatorRecordsService,
    );
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

    await dropH3GridTables();

    await dropH3DataMock([
      'fake_material_table2002',
      'fake_material1_table2002',
      'fake_material2_table2002',
      'fake_material_table_harvest2002',
      'fake_material_table_producer2002',
    ]);
  });

  describe('createIndicatorRecordsBySourcingRecords', () => {
    test('When creating Indicator Records providing indicator coefficients, and one of the indicator coefficients is missing on the DTO, it should throw error', async () => {
      // ARRANGE
      const indicatorPreconditions = await createPreconditions();
      const fakeH3Data = await createH3Data();
      await createMaterialToH3(
        indicatorPreconditions.material1.id,
        fakeH3Data.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord1.id,
        tonnage: indicatorPreconditions.sourcingRecord1.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation1.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation1.materialId,
        year: indicatorPreconditions.sourcingRecord1.year,
      };

      const providedCoefficients: IndicatorCoefficientsDto = {
        [INDICATOR_TYPES.BIODIVERSITY_LOSS]: 0.1,
        [INDICATOR_TYPES.CARBON_EMISSIONS]: 0.4,
        [INDICATOR_TYPES.DEFORESTATION]: 0.35,
        ...({} as any),
      };

      //ACT
      const testStatement = async (): Promise<any> => {
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
          providedCoefficients,
        );
      };

      //ASSERT
      await expect(testStatement).rejects.toThrow(NotFoundException);
      await expect(testStatement).rejects.toThrow(
        `Required coefficient for indicator ${INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE} was not provided`,
      );
    });

    test('When creating Indicator Records providing indicator coefficients, it should create the records properly', async () => {
      // ARRANGE
      const indicatorPreconditions = await createPreconditions();
      const fakeH3Data = await createH3Data();
      const materialH3Data = await createMaterialToH3(
        indicatorPreconditions.material1.id,
        fakeH3Data.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord1.id,
        tonnage: indicatorPreconditions.sourcingRecord1.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation1.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation1.materialId,
        year: indicatorPreconditions.sourcingRecord1.year,
      };

      const providedCoefficients: IndicatorCoefficientsDto = {
        [INDICATOR_TYPES.BIODIVERSITY_LOSS]: 0.1,
        [INDICATOR_TYPES.CARBON_EMISSIONS]: 0.4,
        [INDICATOR_TYPES.DEFORESTATION]: 0.35,
        [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: 0.2,
      };

      //ACT
      const calculatedIndicators =
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
          providedCoefficients,
        );

      //ASSERT

      expect(calculatedIndicators.length).toEqual(4);

      // Value is provided coeff * tonnage, and scaler is null, because it's based on production coefficient, and it's not provided
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
        materialH3Data,
        sourcingData.sourcingRecordId,
        350,
        null,
        calculatedIndicators,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3Data,
        sourcingData.sourcingRecordId,
        100,
        null,
        calculatedIndicators,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        materialH3Data,
        sourcingData.sourcingRecordId,
        400,
        null,
        calculatedIndicators,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        materialH3Data,
        sourcingData.sourcingRecordId,
        200,
        null,
        calculatedIndicators,
      );
    });

    test("When creating indicator record with no provided coefficients, and there's no H3 data for the given material, it should throw an error", async () => {
      //ARRANGE
      const sourcingData = {
        sourcingRecordId: UUIDv4(),
        geoRegionId: UUIDv4(),
        materialId: UUIDv4(),
        tonnage: 10000,
        year: 2010,
      };

      jest
        .spyOn(materialsToH3sService, 'findOne')
        .mockResolvedValueOnce(undefined);

      const testStatement = async (): Promise<any> => {
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );
      };

      //ACT/ASSERT
      await expect(testStatement).rejects.toThrow(MissingH3DataError);
      await expect(testStatement).rejects.toThrow(
        `No H3 Data required to calculate Impact for Material with ID: ${sourcingData.materialId}`,
      );
    });

    test('When creating Indicator Records without providing indicator coefficients, and one of the Material H3 is not available for any year, it should throw error', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
      };

      const h3Material = await h3DataMock({
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
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );
      };

      //ASSERT
      await expect(testStatement).rejects.toThrow(NotFoundException);
      await expect(testStatement).rejects.toThrow(
        `No H3 Data could be found the material ${indicatorPreconditions.material2.id} type ${MATERIAL_TO_H3_TYPE.PRODUCER}`,
      );
    });

    test('When creating Indicator Records without providing indicator coefficients, and one of the Indicator H3 is not available for any year, it should throw error', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
      };

      const h3Material = await h3DataMock({
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
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );
      };

      //ASSERT
      await expect(testStatement).rejects.toThrow(NotFoundException);
      await expect(testStatement).rejects.toThrow(
        `H3 Data of required Indicator of type ${INDICATOR_TYPES.DEFORESTATION} missing for ${INDICATOR_TYPES.DEFORESTATION} Indicator Record value calculations`,
      );
    });

    test('When creating indicators without provided coefficients and the material has H3 data, it should create the indicator records properly', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
      };

      const h3Material = await h3DataMock({
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
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );

      //ASSERT
      // const allIndicators = await indicatorRecordRepository.find();
      expect(calculatedRecords.length).toEqual(4);

      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        80.74534161490683,
        1610,
        calculatedRecords,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        148944.0999601198,
        1610,
        calculatedRecords,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        14.894409937888199,
        1610,
        calculatedRecords,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        materialH3DataProducer,
        sourcingData.sourcingRecordId,
        0.07700000181794166,
        1610,
        calculatedRecords,
      );
    });
    // TODO: Restore when new methodology validated
    test.skip('When creating all indicators records, it should create the indicator records properly', async () => {
      //ARRANGE;
      const indicatorPreconditions = await createPreconditions();

      const h3Material1 = await h3DataMock({
        h3TableName: 'fakeMaterial1Table2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const h3Material2 = await h3DataMock({
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

      await indicatorRecordService.createIndicatorRecordsForAllSourcingRecords();

      //ASSERT
      const allIndicators = await indicatorRecordRepository.find();
      expect(allIndicators.length).toEqual(8);

      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        161.49068322981367,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        297888.1999202396,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        29.788819307125873,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        materialH3DataProducer1,
        indicatorPreconditions.sourcingRecord1.id,
        1.5400000363588333,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        80.74534161490683,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        148944.0999601198,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        14.894409653562937,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        materialH3DataProducer2,
        indicatorPreconditions.sourcingRecord2.id,
        0.7700000181794167,
        1610,
      );
    });

    test("When creating indicators without provided coefficients and the material has H3 data, the raw values for the calculations should be read from the cache if they're already present on the CachedData", async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
      };

      const h3MaterialProducer = await h3DataMock({
        h3TableName: 'fakeMaterialTableProducer2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const h3MaterialHarvest = await h3DataMock({
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
      const materialH3DataHarvest = await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3MaterialHarvest.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      //Small "hack" to access the method to simplify part of the cache key
      const indicatorRecordServiceAny: any = indicatorRecordService;
      const generateIndicatorCacheKey: any =
        indicatorRecordServiceAny.generateIndicatorCalculationCacheKey;
      const generateMaterialCacheKey: any =
        indicatorRecordServiceAny.generateMaterialCalculationCacheKey;

      //Prepare Cache Data
      const bioMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      bioMap.set(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
      );
      bioMap.set(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
      );
      const materialsMap: Map<MATERIAL_TO_H3_TYPE, H3Data> = new Map();
      materialsMap.set(MATERIAL_TO_H3_TYPE.HARVEST, h3MaterialHarvest);
      materialsMap.set(MATERIAL_TO_H3_TYPE.PRODUCER, h3MaterialProducer);

      const bioCacheKey: any = generateIndicatorCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
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
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );

      //ASSERT
      //const allIndicators = await indicatorRecordRepository.find();
      expect(calculatedRecords.length).toEqual(4);

      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3DataHarvest,
        sourcingData.sourcingRecordId,
        1125,
        200,
        calculatedRecords,
      );
    });

    test('When creating indicators without provided coefficients and the raws values are not cached, the raw values for the calculations should be cached after the execution', async () => {
      //ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord2.id,
        tonnage: indicatorPreconditions.sourcingRecord2.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation2.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation2.materialId,
        year: indicatorPreconditions.sourcingRecord2.year,
      };

      const h3MaterialHarvest = await h3DataMock({
        h3TableName: 'fakeMaterialTableHarvest2002',
        h3ColumnName: 'fakeMaterialColumn2002',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });
      const h3MaterialProducer = await h3DataMock({
        h3TableName: 'fakeMaterialTableProducer2002',
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

      // Prepare cached data
      const bioMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      bioMap.set(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
      );
      bioMap.set(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
      );
      const defMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      defMap.set(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
      );
      const carbonMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      carbonMap.set(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
      );
      carbonMap.set(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
      );
      const waterMap: Map<INDICATOR_TYPES, H3Data> = new Map();
      waterMap.set(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
      );

      const materialsMap: Map<MATERIAL_TO_H3_TYPE, H3Data> = new Map();
      materialsMap.set(MATERIAL_TO_H3_TYPE.HARVEST, h3MaterialHarvest);
      materialsMap.set(MATERIAL_TO_H3_TYPE.PRODUCER, h3MaterialProducer);

      //Small "hack" to access the method to simplify part of the cache key
      const indicatorRecordServiceAny: any = indicatorRecordService;
      const generateIndicatorCacheKey: any =
        indicatorRecordServiceAny.generateIndicatorCalculationCacheKey;
      const generateMaterialCacheKey: any =
        indicatorRecordServiceAny.generateMaterialCalculationCacheKey;

      const bioCacheKey: any = generateIndicatorCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        bioMap,
        materialsMap,
      );
      const carbonCacheKey: any = generateIndicatorCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        INDICATOR_TYPES.CARBON_EMISSIONS,
        carbonMap,
        materialsMap,
      );
      const defCacheKey: any = generateIndicatorCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        INDICATOR_TYPES.DEFORESTATION,
        defMap,
        materialsMap,
      );
      const waterCacheKey: any = generateIndicatorCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        waterMap,
        materialsMap,
      );
      const materialHarvestKey: any = generateMaterialCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        h3MaterialHarvest,
      );
      const materialProdKey: any = generateMaterialCacheKey(
        indicatorPreconditions.sourcingLocation2.geoRegionId,
        h3MaterialProducer,
      );

      //ACT
      const calculatedRecords =
        await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
          sourcingData,
        );

      //ASSERT

      await checkCachedData(
        bioCacheKey,
        479600.00187158585,
        CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      );
      await checkCachedData(
        carbonCacheKey,
        47.96,
        CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      );
      await checkCachedData(
        defCacheKey,
        260,
        CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      );
      await checkCachedData(
        waterCacheKey,
        0.00015400000363588332,
        CACHED_DATA_TYPE.RAW_INDICATOR_VALUE_GEOREGION,
      );
      await checkCachedData(
        materialProdKey,
        1610,
        CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      );
      await checkCachedData(
        materialHarvestKey,
        1610,
        CACHED_DATA_TYPE.RAW_MATERIAL_VALUE_GEOREGION,
      );
    });
  });

  /**
   * Does expect checks on all relevant fields of IndicatorRecord
   * @param indicatorType
   * @param h3Data
   * @param materialH3Data
   * @param sourcingRecordId
   * @param recordValue
   * @param scalerValue
   * @param calculatedIndicatorRecords
   */
  async function checkCreatedIndicatorRecord(
    indicatorType: INDICATOR_TYPES,
    h3Data: H3Data,
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
          record.indicatorId === h3Data.indicatorId &&
          record.sourcingRecordId === sourcingRecordId,
      );
    } else {
      createdRecords = await indicatorRecordRepository.find({
        where: { indicatorId: h3Data.indicatorId, sourcingRecordId },
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
    const cachedData: CachedData | undefined =
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

    const h3Data = await createWorldToCalculateIndicatorRecords();

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
      deforestation: h3Data.deforestation,
      waterRisk: h3Data.waterRisk,
      biodiversityLoss: h3Data.biodiversityLoss,
      carbonEmissions: h3Data.carbonEmissions,
    };
  }
});
