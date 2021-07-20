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
import { SourcingRecordGroupRepository } from 'modules/sourcing-record-groups/sourcing-record-group.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { AdminRegion } from '../../../src/modules/admin-regions/admin-region.entity';
import { SourcingLocation } from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from '../../../src/modules/sourcing-records/sourcing-record.entity';

describe('XLSX Upload Feature Tests (e2e)', () => {
  let app: INestApplication;
  let businessUnitRepository: BusinessUnitRepository;
  let materialRepository: MaterialRepository;
  let supplierRepository: SupplierRepository;
  let adminRegionRepository: AdminRegionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let sourcingRecordGroupRepository: SourcingRecordGroupRepository;

  beforeAll(async () => {
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
    sourcingRecordGroupRepository = moduleFixture.get<SourcingRecordGroupRepository>(
      SourcingRecordGroupRepository,
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
    await sourcingRecordGroupRepository.delete({});
    jest.clearAllTimers();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'A .XLSX file must be provided as payload',
    );
  });

  test('When an empty file is sent to the API then it should return a 400 code and a error message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
      .attach('file', __dirname + '/empty.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'XLSX file could not been parsed: Spreadsheet is missing requires sheets: materials, business units, suppliers, countries, for upload',
    );
  });

  test('When a file is sent to the API and some data does not comply with data validation rules, it should return a 400 code and a error message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
      .attach('file', __dirname + '/business-unit-name-length.xlsx')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'XLSX file could not been parsed: An instance of CreateBusinessUnitDto has failed the validation:\n' +
        ' - property name has failed the following constraints: maxLength \n',
    );
  });

  test('When a file is sent to the API and its size is allowed then it should return a 201 code and the storage folder should be empty', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.CREATED);
    const folderContent = await readdir(config.get('fileUploads.storagePath'));
    expect(folderContent.length).toEqual(0);
  });

  test('When a valid file is sent to the API it should return a 201 code and the data in it should be imported (happy case)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
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
  });

  test('When a file is sent 2 times to the API, then imported data length should be equal, and database has been cleaned in between', async () => {
    jest.setTimeout(10000);
    await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
      .attach('file', __dirname + '/base-dataset.xlsx');

    await request(app.getHttpServer())
      .post('/api/v1/import/xlsx')
      .attach('file', __dirname + '/base-dataset.xlsx');

    const sourcingLocations: SourcingLocation[] = await sourcingLocationRepository.find();
    expect(sourcingLocations.length).toEqual(825);
  });
});
