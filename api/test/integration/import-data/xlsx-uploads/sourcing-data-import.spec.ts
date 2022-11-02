import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  createAdminRegion,
  createBusinessUnit,
  createGeoRegion,
  createMaterial,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../../entity-mocks';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { UnknownLocationGeoCodingStrategy } from 'modules/geo-coding/strategies/unknown-location.geocoding.service';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import {
  createMaterialTreeForXLSXImport,
  createIndicatorsForXLSXImport,
} from './import-mocks';
import {
  h3DataMock,
  dropH3DataMock,
} from '../../../e2e/h3-data/mocks/h3-data.mock';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { h3BasicFixture } from '../../../e2e/h3-data/mocks/h3-fixtures';
import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import { FileService } from 'modules/import-data/file.service';
import { createWorldToCalculateIndicatorRecords } from '../../../utils/indicator-records-preconditions';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { Material } from 'modules/materials/material.entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
let tablesToDrop: string[] = [];

let missingDataFallbackPolicy: string = 'error';

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    switch (key) {
      case 'import.missingDataFallbackStrategy':
        return missingDataFallbackPolicy;
      default:
        return configGet.call(config, key);
    }
  };
  return config;
});
// TODO: Restore when new methodology validated
describe.skip('Sourcing Data import', () => {
  /**
   * @note: We are currently ignoring '#N/A' location type values in production code
   * so this mock filters them to avoid DB constraint errors for not be one of the allowed
   * location types (enum)
   */
  const geoCodingServiceMock = {
    geoCodeLocations: async (sourcingData: any): Promise<any> => {
      const geoRegion: GeoRegion | undefined =
        await geoRegionRepository.findOne({
          name: 'ABC',
        });
      if (geoRegion === undefined) {
        throw new Error('Could not find expected mock GeoRegion with name=ABC');
      }
      const adminRegion: AdminRegion | undefined =
        await adminRegionRepository.findOne({
          geoRegionId: geoRegion.id,
        });
      if (adminRegion === undefined) {
        throw new Error(
          'Could not find expected mock AdminRegion for GeoRegion with name=ABC',
        );
      }

      return sourcingData
        .filter(
          (each: SourcingData | { locationType: '#N/A' }) =>
            each.locationType !== '#N/A',
        )
        .map((each: SourcingData) => ({
          ...each,
          adminRegionId: adminRegion.id,
          geoRegionId: geoRegion.id,
        }));
    },
  };

  class UnknownLocationServiceMock extends UnknownLocationGeoCodingStrategy {
    async geoCodeByCountry(): Promise<any> {
      return {
        results: [
          {
            address_components: [
              {
                short_name: 'ABC',
              },
            ],
          },
        ],
      };
    }
  }

  class MockFileService extends FileService<any> {
    async deleteDataFromFS(): Promise<void> {
      return;
    }
  }

  let businessUnitRepository: BusinessUnitRepository;
  let materialRepository: MaterialRepository;
  let materialToH3Service: MaterialsToH3sService;
  let supplierRepository: SupplierRepository;
  let adminRegionRepository: AdminRegionRepository;
  let geoRegionRepository: GeoRegionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let indicatorRepository: IndicatorRepository;
  let sourcingLocationGroupRepository: SourcingLocationGroupRepository;
  let h3DataRepository: H3DataRepository;
  let sourcingDataImportService: SourcingDataImportService;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    jest.setTimeout(10000);
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
    })
      .overrideProvider(FileService)
      .useClass(MockFileService)
      .overrideProvider(GeoCodingAbstractClass)
      .useValue(geoCodingServiceMock)
      .overrideProvider(UnknownLocationGeoCodingStrategy)
      .useClass(UnknownLocationServiceMock)
      .compile();

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
    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    sourcingDataImportService = moduleFixture.get<SourcingDataImportService>(
      SourcingDataImportService,
    );
  });

  afterEach(async () => {
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await indicatorRepository.delete({});
    await businessUnitRepository.delete({});
    await adminRegionRepository.delete({});
    await geoRegionRepository.delete({});
    await supplierRepository.delete({});
    await indicatorRecordRepository.delete({});
    await sourcingRecordRepository.delete({});
    await sourcingLocationRepository.delete({});
    await sourcingLocationGroupRepository.delete({});
    await h3DataRepository.delete({});

    if (tablesToDrop.length > 0) {
      await dropH3DataMock(tablesToDrop);
      tablesToDrop = [];
    }
  });

  afterAll(async () => {
    jest.clearAllTimers();
    return moduleFixture.close();
  });

  test('When a file is processed by the API and there are no materials in the database, an error should be displayed', async () => {
    expect.assertions(1);
    try {
      await sourcingDataImportService.importSourcingData(
        __dirname + '/test-base-dataset.xlsx',
        '',
      );
    } catch (err: any) {
      expect(err.message).toEqual(
        'No Materials found present in the DB. Please check the LandGriffon installation manual',
      );
    }
  }, 100000);

  test('When a file is processed by the API and its size is allowed then it should return a 201 code and the storage folder should be empty', async () => {
    const geoRegion: GeoRegion = await createGeoRegion({
      isCreatedByUser: false,
    });
    await createAdminRegion({
      isoA2: 'ABC',
      geoRegion,
    });

    const indicatorPreconditions =
      await createWorldToCalculateIndicatorRecords();

    tablesToDrop = [
      ...(await createMaterialTreeForXLSXImport()),
      ...indicatorPreconditions.h3tableNames,
    ];

    await sourcingDataImportService.importSourcingData(
      __dirname + '/test-base-dataset.xlsx',
      '',
    );
  }, 100000);

  test('When a valid file is sent to the API it should return a 201 code and the data in it should be imported (happy case)', async () => {
    const geoRegion: GeoRegion = await createGeoRegion({
      isCreatedByUser: false,
    });
    await createAdminRegion({
      isoA2: 'ABC',
      geoRegion,
    });

    const indicatorPreconditions =
      await createWorldToCalculateIndicatorRecords();
    tablesToDrop = [
      ...(await createMaterialTreeForXLSXImport()),
      ...indicatorPreconditions.h3tableNames,
    ];

    await sourcingDataImportService.importSourcingData(
      __dirname + '/test-base-dataset.xlsx',
      '',
    );

    const businessUnits: BusinessUnit[] = await businessUnitRepository.find();
    expect(businessUnits).toHaveLength(5);
    const businessUnitsRoots: BusinessUnit[] =
      await businessUnitRepository.findRoots();
    expect(businessUnitsRoots).toHaveLength(1);

    const suppliers: Supplier[] = await supplierRepository.find();
    expect(suppliers).toHaveLength(5);
    const suppliersRoots: Supplier[] = await supplierRepository.findRoots();
    expect(suppliersRoots).toHaveLength(4);

    const sourcingRecords: SourcingRecord[] =
      await sourcingRecordRepository.find();
    expect(sourcingRecords).toHaveLength(495);

    const indicatorRecords: IndicatorRecord[] =
      await indicatorRecordRepository.find();
    expect(indicatorRecords).toHaveLength(495 * 4);

    const sourcingLocations: SourcingLocation[] =
      await sourcingLocationRepository.find();
    expect(sourcingLocations).toHaveLength(45);
    sourcingLocations.forEach((sourcingLocation: SourcingLocation) => {
      expect(sourcingLocation.materialId).not.toEqual(null);
    });
  }, 100000);

  test('When a file is processed by the API and gets processed, then a request to Sourcing-Records should return an existing Sourcing-Location ID', async () => {
    const geoRegion: GeoRegion = await createGeoRegion({
      isCreatedByUser: false,
    });
    await createAdminRegion({
      isoA2: 'ABC',
      geoRegion,
    });

    const indicatorPreconditions =
      await createWorldToCalculateIndicatorRecords();
    tablesToDrop = [
      ...(await createMaterialTreeForXLSXImport()),
      ...indicatorPreconditions.h3tableNames,
    ];

    await sourcingDataImportService.importSourcingData(
      __dirname + '/test-base-dataset.xlsx',
      '',
    );

    const sourcingRecords: SourcingRecord[] =
      await sourcingRecordRepository.find();
    const sourcingLocation: SourcingLocation | undefined =
      await sourcingLocationRepository.findOne(
        sourcingRecords[0].sourcingLocationId,
      );

    expect(sourcingRecords[0]).toMatchObject(new SourcingRecord());
    expect(sourcingLocation).toMatchObject(new SourcingLocation());
  }, 100000);

  test('Impact calculations of the import process must not be done for sourcing records, belonging to Scenario Interventions', async () => {
    const geoRegion: GeoRegion = await createGeoRegion({
      isCreatedByUser: false,
    });
    await createAdminRegion({
      isoA2: 'ABC',
      geoRegion,
    });

    await createMaterialTreeForXLSXImport();
    await createWorldToCalculateIndicatorRecords();

    const materials: Material[] = await materialRepository.find();

    const scenarioIntervention: ScenarioIntervention =
      await createScenarioIntervention();

    const existingSouringLocation: SourcingLocation =
      await createSourcingLocation({
        materialId: materials[0].id,
        geoRegionId: geoRegion.id,
      });

    const interventionSouringLocation: SourcingLocation =
      await createSourcingLocation({
        materialId: materials[1].id,
        geoRegionId: geoRegion.id,
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      });
    await createSourcingRecord({
      sourcingLocationId: existingSouringLocation.id,
      year: 2019,
      tonnage: 1000,
    });

    await createSourcingRecord({
      sourcingLocationId: interventionSouringLocation.id,
      year: 2019,
      tonnage: 500,
    });

    const indicatorRawDataForImport: SourcingRecordsWithIndicatorRawDataDto[] =
      await indicatorRecordRepository.getIndicatorRawDataForAllSourcingRecords();

    expect(indicatorRawDataForImport.length).toEqual(1);
    expect(indicatorRawDataForImport[0].sourcingLocationId).toBe(
      existingSouringLocation.id,
    );
  }, 100000);

  describe.skip('Additional config values for missing data fallback strategy and incomplete material h3 data', () => {
    test('When a valid file is sent to the API it should return a 400 bad request code, and an error should be displayed (error strategy)', async () => {
      missingDataFallbackPolicy = 'error';

      const geoRegion: GeoRegion = await createGeoRegion();
      await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });
      await h3DataMock({
        h3TableName: 'h3_grid_deforestation_global',
        h3ColumnName: 'hansen_loss_2019',
        year: 2019,
        additionalH3Data: h3BasicFixture,
      });
      tablesToDrop = [
        ...(await createMaterialTreeForXLSXImport({ startYear: 2020 })),
        ...(await createIndicatorsForXLSXImport()),
        'h3_grid_deforestation_global',
      ];

      try {
        await sourcingDataImportService.importSourcingData(
          __dirname + '/base-dataset-one-material.xlsx',
          '',
        );
      } catch (err: any) {
        expect(err.message).toEqual(
          'Cannot calculate impact for sourcing record - missing producer h3 data for material "Maize (corn)" and year "2010"',
        );
      }
    }, 100000);

    test('When a valid file is sent to the API it should return a 201 code and the data in it should be imported (ignore strategy)', async () => {
      missingDataFallbackPolicy = 'ignore';

      const geoRegion: GeoRegion = await createGeoRegion();
      await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });
      await h3DataMock({
        h3TableName: 'h3_grid_deforestation_global',
        h3ColumnName: 'hansen_loss_2019',
        year: 2019,
        additionalH3Data: h3BasicFixture,
      });
      tablesToDrop = [
        ...(await createMaterialTreeForXLSXImport({ startYear: 2020 })),
        ...(await createIndicatorsForXLSXImport()),
        'h3_grid_deforestation_global',
      ];

      await sourcingDataImportService.importSourcingData(
        __dirname + '/base-dataset.xlsx',
        '',
      );

      const businessUnits: BusinessUnit[] = await businessUnitRepository.find();
      expect(businessUnits).toHaveLength(5);
      const businessUnitsRoots: BusinessUnit[] =
        await businessUnitRepository.findRoots();
      expect(businessUnitsRoots).toHaveLength(1);

      const suppliers: Supplier[] = await supplierRepository.find();
      expect(suppliers).toHaveLength(5);
      const suppliersRoots: Supplier[] = await supplierRepository.findRoots();
      expect(suppliersRoots).toHaveLength(4);

      const sourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find();
      expect(sourcingRecords).toHaveLength(11 * 45); //11 year, 45 rows

      const indicatorRecords: IndicatorRecord[] =
        await indicatorRecordRepository.find();
      expect(indicatorRecords).toHaveLength(45 * 4); //1 year, 45 rows, 4 indicators

      const sourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find();
      expect(sourcingLocations).toHaveLength(45);
      sourcingLocations.forEach((sourcingLocation: SourcingLocation) => {
        expect(sourcingLocation.materialId).not.toEqual(null);
      });
    }, 100000);

    test('When a valid file is sent to the API it should return a 201 code and the data in it should be imported (fallback strategy)', async () => {
      missingDataFallbackPolicy = 'fallback';

      const geoRegion: GeoRegion = await createGeoRegion();
      await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });
      await h3DataMock({
        h3TableName: 'h3_grid_deforestation_global',
        h3ColumnName: 'hansen_loss_2019',
        year: 2019,
        additionalH3Data: h3BasicFixture,
      });
      tablesToDrop = [
        ...(await createMaterialTreeForXLSXImport({ startYear: 2020 })),
        ...(await createIndicatorsForXLSXImport()),
        'h3_grid_deforestation_global',
      ];

      await sourcingDataImportService.importSourcingData(
        __dirname + '/base-dataset.xlsx',
        '',
      );

      const businessUnits: BusinessUnit[] = await businessUnitRepository.find();
      expect(businessUnits).toHaveLength(5);
      const businessUnitsRoots: BusinessUnit[] =
        await businessUnitRepository.findRoots();
      expect(businessUnitsRoots).toHaveLength(1);

      const suppliers: Supplier[] = await supplierRepository.find();
      expect(suppliers).toHaveLength(5);
      const suppliersRoots: Supplier[] = await supplierRepository.findRoots();
      expect(suppliersRoots).toHaveLength(4);

      const sourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find();
      expect(sourcingRecords).toHaveLength(45 * 11); //11 year, 45 rows
      expect(
        sourcingRecords.map(
          (sourcingRecord: SourcingRecord) => sourcingRecord.year,
        ),
      );

      const indicatorRecords: IndicatorRecord[] =
        await indicatorRecordRepository.find();
      expect(indicatorRecords).toHaveLength(45 * 11 * 4); //11 year, 45 rows, 4 indicators

      const sourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find();
      expect(sourcingLocations).toHaveLength(45);
      sourcingLocations.forEach((sourcingLocation: SourcingLocation) => {
        expect(sourcingLocation.materialId).not.toEqual(null);
      });
    }, 100000);

    test('When a new Import process is triggered, Then the existing data imported/generated by the user should be deleted, and remaining data should stay', async () => {
      await createGeoRegion({
        isCreatedByUser: true,
      });
      const geoRegion: GeoRegion = await createGeoRegion();
      const adminRegion: AdminRegion = await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });
      const adminRegionWithUserGeoRegion: AdminRegion = await createAdminRegion(
        {
          isoA2: 'GHI',
        },
      );
      const businessUnit: BusinessUnit = await createBusinessUnit({
        name: 'Business Unit 1',
      });
      const supplier: Supplier = await createSupplier({
        name: 'Supplier 1',
      });
      const material: Material = await createMaterial({
        name: 'Material 1',
      });
      const sourcinRecord: SourcingRecord = await createSourcingRecord({
        year: 2019,
      });
      const sourcingRecord2: SourcingRecord = await createSourcingRecord({
        year: 2020,
      });
      await createSourcingLocation({
        sourcingRecords: [sourcinRecord],
        adminRegion,
        businessUnit,
        t1Supplier: supplier,
        material,
      });
      await createSourcingLocation({
        sourcingRecords: [sourcingRecord2],
        adminRegion: adminRegionWithUserGeoRegion,
        businessUnit,
        t1Supplier: supplier,
        material,
      });

      sourcingDataImportService.cleanDataBeforeImport();

      expect(
        await geoRegionRepository.find({ isCreatedByUser: true }),
      ).toHaveLength(0);
      expect(await geoRegionRepository.find()).toHaveLength(1);
      expect(await adminRegionRepository.find()).toHaveLength(2);
      expect(await sourcingLocationRepository.find()).toHaveLength(0);
      expect(await sourcingRecordRepository.find()).toHaveLength(0);
      expect(await businessUnitRepository.find()).toHaveLength(0);
      expect(await supplierRepository.find()).toHaveLength(0);
    });
  });
});
