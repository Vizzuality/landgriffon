import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { Material } from 'modules/materials/material.entity';
import { readdir } from 'fs/promises';
import * as config from 'config';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

describe('Sourcing Records import', () => {
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
    }).compile();

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
    await sourcingLocationRepository.delete({});
    await sourcingRecordRepository.delete({});
    await sourcingLocationGroupRepository.delete({});
    jest.clearAllTimers();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'A .XLSX file must be provided as payload',
    );
  });

  test('When an empty file is sent to the API then it should return a 400 code and a error message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/empty.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'XLSX file could not been parsed: Spreadsheet is missing requires sheets: materials, business units, suppliers, countries, for upload',
    );
  });

  test('When a file is sent to the API and some data does not comply with data validation rules, it should return a 400 code and a error message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/business-unit-name-length.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'An instance of CreateBusinessUnitDto has failed the validation:\n' +
        ' - property name has failed the following constraints: maxLength \n',
    );
  });

  test('When a file is sent to the API and its size is allowed then it should return a 201 code and the storage folder should be empty', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.CREATED);
    const folderContent = await readdir(config.get('fileUploads.storagePath'));
    expect(folderContent.length).toEqual(0);
  });

  test('When a valid file is sent to the API it should return a 201 code and the data in it should be imported (happy case)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.CREATED);

    const businessUnits: BusinessUnit[] = await businessUnitRepository.find();
    expect(businessUnits).toHaveLength(5);
    const businessUnitsRoots: BusinessUnit[] = await businessUnitRepository.findRoots();
    expect(businessUnitsRoots).toHaveLength(1);

    const materials: Material[] = await materialRepository.find();
    expect(materials).toHaveLength(305);
    const materialsRoots: Material[] = await materialRepository.findRoots();
    expect(materialsRoots).toHaveLength(30);

    const suppliers: Supplier[] = await supplierRepository.find();
    expect(suppliers).toHaveLength(4);
    const suppliersRoots: Supplier[] = await supplierRepository.findRoots();
    expect(suppliersRoots).toHaveLength(3);

    const adminRegions: AdminRegion[] = await adminRegionRepository.find();
    expect(adminRegions).toHaveLength(238);
    const adminRegionsRoots: AdminRegion[] = await adminRegionRepository.findRoots();
    expect(adminRegionsRoots).toHaveLength(238);

    const sourcingRecords: SourcingRecord[] = await sourcingRecordRepository.find();
    expect(sourcingRecords).toHaveLength(825);

    /**
     * @TODO: this is a bug. There should NOT be as many sourcing locations as there are records. There should be around 1/10
     */
    const sourcingLocations: SourcingLocation[] = await sourcingLocationRepository.find();
    expect(sourcingLocations).toHaveLength(75);
  });

  test('When a file is sent 2 times to the API, then imported data length should be equal, and database has been cleaned in between', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/base-dataset.xlsx');

    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/base-dataset.xlsx');

    const sourcingRecords: SourcingRecord[] = await sourcingRecordRepository.find();
    expect(sourcingRecords.length).toEqual(825);
  });

  test('When a file is sent to the API and gets processed, then a request to Sourcing-Records should return a existing Sourcing-Location ID', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-records')
      .attach('file', __dirname + '/base-dataset.xlsx');

    const sourcingRecords: SourcingRecord[] = await sourcingRecordRepository.find();
    const sourcingLocation:
      | SourcingLocation
      | undefined = await sourcingLocationRepository.findOne(
      sourcingRecords[0].sourcingLocationId,
    );

    expect(sourcingRecords[0].sourcingLocationId).toBeTruthy();
    expect(sourcingLocation).toBeDefined();
  });
});
