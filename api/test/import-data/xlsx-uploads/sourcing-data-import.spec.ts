import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { readdir } from 'fs/promises';
import * as config from 'config';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { createMaterial } from '../../entity-mocks';

describe('Sourcing Data import', () => {
  /**
   * @note: We are currently ignoring '#N/A' location type values in production code
   * so this mock filters them to avoid DB constraint errors for not be one of the allowed
   * location types (enum)
   */
  const geoCodingServiceMock = {
    geoCodeLocations: async (sourcingData: any): Promise<any> => {
      return sourcingData.filter(
        (each: SourcingData | { locationType: '#N/A' }) =>
          each.locationType !== '#N/A',
      );
    },
  };

  let app: INestApplication;
  let businessUnitRepository: BusinessUnitRepository;
  let materialRepository: MaterialRepository;
  let supplierRepository: SupplierRepository;
  let adminRegionRepository: AdminRegionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let sourcingLocationGroupRepository: SourcingLocationGroupRepository;

  beforeAll(async () => {
    jest.setTimeout(10000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
    })
      .overrideProvider(GeoCodingService)
      .useValue(geoCodingServiceMock)
      .compile();

    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    materialRepository = moduleFixture.get<MaterialRepository>(
      MaterialRepository,
    );
    supplierRepository = moduleFixture.get<SupplierRepository>(
      SupplierRepository,
    );
    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
    sourcingLocationGroupRepository = moduleFixture.get<SourcingLocationGroupRepository>(
      SourcingLocationGroupRepository,
    );

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await materialRepository.delete({});
    await businessUnitRepository.delete({});
    await adminRegionRepository.delete({});
    await supplierRepository.delete({});
    await sourcingRecordRepository.delete({});
    await sourcingLocationRepository.delete({});
    await sourcingLocationGroupRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
    jest.clearAllTimers();
  });

  test('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'A .XLSX file must be provided as payload',
    );
  });

  test('When an empty file is sent to the API then it should return a 400 code and a error message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/empty.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'XLSX file could not been parsed: Spreadsheet is missing requires sheets: materials, business units, suppliers, countries, for upload',
    );
  });

  test('When a file is sent to the API and some data does not comply with data validation rules, it should return a 400 code and a error message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/business-unit-name-length.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'An instance of CreateBusinessUnitDto has failed the validation:\n' +
        ' - property name has failed the following constraints: maxLength \n',
    );
  });

  test('When a file is sent to the API and there are no materials in the database, an error should be displayed', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'No Materials found present in the DB. Please check the LandGriffon installation manual',
    );
  });

  test('When a file is sent to the API and its size is allowed then it should return a 201 code and the storage folder should be empty', async () => {
    await createMaterial();

    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.CREATED);
    const folderContent = await readdir(config.get('fileUploads.storagePath'));
    expect(folderContent.length).toEqual(0);
  });

  test('When a valid file is sent to the API it should return a 201 code and the data in it should be imported (happy case)', async () => {
    const material08 = await createMaterial({
      hsCodeId: '08',
    });
    const material09 = await createMaterial({
      hsCodeId: '09',
    });
    const material10 = await createMaterial({
      hsCodeId: '10',
    });
    await createMaterial({
      parent: material08,
      hsCodeId: '0803',
    });
    await createMaterial({
      parent: material09,
      hsCodeId: '901',
    });
    await createMaterial({
      parent: material10,
      hsCodeId: '1005',
    });
    await createMaterial({
      hsCodeId: '40',
    });
    await createMaterial({
      hsCodeId: '52',
    });
    await createMaterial({
      hsCodeId: '41',
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.CREATED);

    const businessUnits: BusinessUnit[] = await businessUnitRepository.find();
    expect(businessUnits).toHaveLength(5);
    const businessUnitsRoots: BusinessUnit[] = await businessUnitRepository.findRoots();
    expect(businessUnitsRoots).toHaveLength(1);

    const suppliers: Supplier[] = await supplierRepository.find();
    expect(suppliers).toHaveLength(5);
    const suppliersRoots: Supplier[] = await supplierRepository.findRoots();
    expect(suppliersRoots).toHaveLength(4);

    const sourcingRecords: SourcingRecord[] = await sourcingRecordRepository.find();
    expect(sourcingRecords).toHaveLength(495);

    const sourcingLocations: SourcingLocation[] = await sourcingLocationRepository.find();
    expect(sourcingLocations).toHaveLength(45);
    sourcingLocations.forEach((sourcingLocation: SourcingLocation) => {
      expect(sourcingLocation.materialId).not.toEqual(null);
    });
  });

  test('When a file is sent 2 times to the API, then imported data length should be equal, and database has been cleaned in between', async () => {
    await createMaterial();

    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx');

    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx');

    const sourcingRecords: SourcingRecord[] = await sourcingRecordRepository.find();
    expect(sourcingRecords.length).toEqual(495);
  });

  test('When a file is sent to the API and gets processed, then a request to Sourcing-Records should return a existing Sourcing-Location ID', async () => {
    await createMaterial();

    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx');

    const sourcingRecords: SourcingRecord[] = await sourcingRecordRepository.find();
    const sourcingLocation:
      | SourcingLocation
      | undefined = await sourcingLocationRepository.findOne(
      sourcingRecords[0].sourcingLocation,
    );

    expect(sourcingRecords[0]).toMatchObject(new SourcingRecord());
    expect(sourcingLocation).toMatchObject(new SourcingLocation());
  });
});
