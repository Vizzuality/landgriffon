import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import {
  createAdminRegion,
  createBusinessUnit,
  createGeoRegion,
  createMaterial,
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
    await h3DataRepository.delete({});
    await geoRegionRepository.delete({});
    await materialRepository.delete({});

    await dropH3GridTables();
  });

  describe('createIndicatorRecordsBySourcingRecords', () => {
    test('When creating Indicator Records providing indicator coefficients, it should create the records properly', async () => {
      // ARRANGE
      const indicatorPreconditions = await createPreconditions();

      const sourcingData = {
        sourcingRecordId: indicatorPreconditions.sourcingRecord1.id,
        tonnage: indicatorPreconditions.sourcingRecord1.tonnage,
        geoRegionId: indicatorPreconditions.sourcingLocation1.geoRegionId,
        materialId: indicatorPreconditions.sourcingLocation1.materialId,
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
        sourcingData,
        350,
        null,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        sourcingData,
        100,
        null,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        sourcingData,
        400,
        null,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        sourcingData,
        200,
        null,
      );
    });

    test("When creating indicator record with no provided coefficients, and there's no H3 data for the given material, it should throw an error it should create corresponding CANCELLED Sourcing Locations, with the appropiate Sourcing Records and Indicator Records", async () => {
      //ARRANGE
      const sourcingData = {
        sourcingRecordId: UUIDv4(),
        geoRegionId: UUIDv4(),
        materialId: UUIDv4(),
        tonnage: 10000,
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
        `No H3 Data required for calculate Impact for Material with ID: ${sourcingData.materialId}`,
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
      };

      // The original function only expects for one MaterialTo3 data, the values don't matter
      jest.spyOn(materialsToH3sService, 'findOne').mockResolvedValue({
        materialId: UUIDv4(),
        id: UUIDv4(),
        h3DataId: UUIDv4(),
        ...({} as any),
      });
      jest
        .spyOn(
          indicatorRecordRepository,
          'getIndicatorRawDataByGeoRegionAndMaterial',
        )
        .mockResolvedValueOnce({
          production: 10,
          harvestedArea: 100,
          rawBiodiversity: 10,
          rawCarbon: 5,
          rawDeforestation: 20,
          rawWater: 25,
        });

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
        sourcingData,
        1000,
        10,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.BIODIVERSITY_LOSS,
        indicatorPreconditions.biodiversityLoss,
        sourcingData,
        500,
        10,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.CARBON_EMISSIONS,
        indicatorPreconditions.carbonEmissions,
        sourcingData,
        250,
        10,
      );
      await checkCreatedIndicatorRecord(
        INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        indicatorPreconditions.waterRisk,
        sourcingData,
        12500,
        10,
      );
    });
  });

  /**
   * Does expect checks on all relevant fields of IndicatorRecord
   * @param indicatorType
   * @param h3Data
   * @param sourcingData
   * @param recordValue
   * @param scalerValue
   */
  async function checkCreatedIndicatorRecord(
    indicatorType: INDICATOR_TYPES,
    h3Data: H3Data,
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
    expect(indicatorRecords[0].materialH3DataId).toEqual(h3Data.id);
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

    const material2: Material = await createMaterial({ name: 'Dilithium' });
    const supplier2: Supplier = await createSupplier({ name: 'Starfleet' });
    const geoRegion2: GeoRegion = await createGeoRegion({ name: 'geoRegion2' });
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
