import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
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
import { INDICATOR_RECORD_STATUS } from 'modules/indicator-records/indicator-record.entity';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
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

  let indicatorRecordService: IndicatorRecordsService;
  let materialsToH3sService: MaterialsToH3sService;

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

    indicatorRecordService = testingModule.get<IndicatorRecordsService>(
      IndicatorRecordsService,
    );
    materialsToH3sService = testingModule.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
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

    await dropH3GridTables();

    await dropH3DataMock(['fake_material_table2002']);
  });

  describe('createIndicatorRecordsBySourcingRecords', () => {
    test('When creating Indicator Records providing indicator coefficients, and one of the indicator coefficients is missing on the DTO, it should throw error', async () => {
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
      await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
        sourcingData,
        providedCoefficients,
      );

      //ASSERT
      const allIndicators = await indicatorRecordRepository.find();
      expect(allIndicators.length).toEqual(4);

      //Value is provided coeff * tonnage, and scaler is null, because it's based on production coefficient, and it's not provided
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
        materialH3Data,
        sourcingData,
        350,
        null,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3Data,
        sourcingData,
        100,
        null,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        materialH3Data,
        sourcingData,
        400,
        null,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        materialH3Data,
        sourcingData,
        200,
        null,
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
      const materialH3DataHarvest = await createMaterialToH3(
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
      const materialH3DataHarvest = await createMaterialToH3(
        indicatorPreconditions.material2.id,
        h3Material.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      //ACT
      await indicatorRecordService.createIndicatorRecordsBySourcingRecords(
        sourcingData,
      );

      //ASSERT
      const allIndicators = await indicatorRecordRepository.find();
      expect(allIndicators.length).toEqual(4);

      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.DEFORESTATION,
        indicatorPreconditions.deforestation,
        materialH3DataProducer,
        sourcingData,
        80.74534161490683,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        materialH3DataProducer,
        sourcingData,
        148944.0999601198,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        materialH3DataProducer,
        sourcingData,
        14.894409937888199,
        1610,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        materialH3DataProducer,
        sourcingData,
        0.07700000181794166,
        1610,
      );
    });
  });

  /**
   * Does expect checks on all relevant fields of IndicatorRecord
   * @param indicatorType
   * @param h3Data
   * @param materialH3Data
   * @param sourcingData
   * @param recordValue
   * @param scalerValue
   */
  async function checkCreatedIndicatorRecord(
    indicatorType: INDICATOR_TYPES,
    h3Data: H3Data,
    materialH3Data: MaterialToH3,
    sourcingData: any,
    recordValue: number,
    scalerValue: number | null,
  ): Promise<void> {
    const indicatorRecords = await indicatorRecordRepository.find({
      where: { indicatorId: h3Data.indicatorId },
    });
    expect(indicatorRecords.length).toEqual(1);
    expect(indicatorRecords[0].sourcingRecordId).toEqual(
      sourcingData.sourcingRecordId,
    );
    expect(indicatorRecords[0].status).toEqual(INDICATOR_RECORD_STATUS.SUCCESS);
    expect(indicatorRecords[0].value).toEqual(recordValue);
    expect(indicatorRecords[0].scaler).toEqual(scalerValue);
    expect(indicatorRecords[0].materialH3DataId).toEqual(
      materialH3Data.h3DataId,
    );
    //Inidicator Coefficients are not checked because it's not used
  }

  async function createPreconditions(): Promise<any> {
    const material1: Material = await createMaterial({ name: 'Vibranium' });
    const supplier1: Supplier = await createSupplier({
      name: 'Stark Industries',
    });
    const geoRegion1: GeoRegion = await createGeoRegion({ name: 'geoRegion1' });
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
