import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import {
  createMaterial,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';

describe('Materials - Get the list of Materials uploaded by User with details', () => {
  let app: INestApplication;
  let sourcingLocationRepository: SourcingLocationRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('Getting list of materials uploaded by users (and being part of sourcing locations) should be successful with default pagination', async () => {
    // Creating various materials and suppliers for sourcing locations:
    const supplier1: Supplier = await createSupplier();
    const supplier2: Supplier = await createSupplier();

    const material1: Material = await createMaterial({ name: 'bananas' });
    const material2: Material = await createMaterial({ name: 'maize' });
    const material3: Material = await createMaterial({ name: 'cotton' });
    await createMaterial({ name: 'cocoa' });
    await createMaterial({ name: 'soya beans' });

    // Creating sourcing locations for different materials and suppliers
    const sourcingLocation1 = await createSourcingLocation({
      t1SupplierId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material1.id,
    });
    await createSourcingLocation({
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.AGGREGATION_POINT,
      materialId: material2.id,
    });
    await createSourcingLocation({
      t1SupplierId: supplier2.id,
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material3.id,
    });

    await createSourcingRecord({
      tonnage: 1000,
      year: 2000,
      sourcingLocation: sourcingLocation1,
    });

    await createSourcingRecord({
      tonnage: 1000,
      year: 2001,
      sourcingLocation: sourcingLocation1,
    });

    await createSourcingRecord({
      tonnage: 1000,
      year: 2002,
      sourcingLocation: sourcingLocation1,
    });

    const responseWithDefaultPagination = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(responseWithDefaultPagination.body.data.length).toEqual(3);

    expect(
      responseWithDefaultPagination.body.data[0].attributes.materialName,
    ).toEqual(material1.name);
    expect(
      responseWithDefaultPagination.body.data[1].attributes.t1Supplier,
    ).toEqual(supplier2.name);
    expect(
      responseWithDefaultPagination.body.data[2].attributes.materialName,
    ).toEqual(material2.name);
    expect(
      responseWithDefaultPagination.body.data[0].attributes.purchases.length,
    ).toEqual(3);
    expect(
      responseWithDefaultPagination.body.data[0].attributes.purchases,
    ).toEqual(
      expect.arrayContaining([
        { tonnage: '1000', year: 2000 },
        { tonnage: '1000', year: 2001 },
        { tonnage: '1000', year: 2002 },
      ]),
    );
    expect(responseWithDefaultPagination.body.meta.size).toEqual(25);
    expect(responseWithDefaultPagination.body.meta.totalItems).toEqual(3);
    expect(responseWithDefaultPagination.body.meta.totalPages).toEqual(1);

    const responseWithCustomPagination = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, 'page[size]': 2 })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(responseWithCustomPagination.body.meta.size).toEqual(2);
    expect(responseWithCustomPagination.body.meta.totalItems).toEqual(3);
    expect(responseWithCustomPagination.body.meta.totalPages).toEqual(2);
    expect(responseWithCustomPagination.body.data.length).toBe(2);
  });

  test('Getting list of materials with search flag to search for material names should be successful', async () => {
    const supplier1: Supplier = await createSupplier();

    const material1: Material = await createMaterial({ name: 'bananas' });
    const material2: Material = await createMaterial({ name: 'maize' });
    const material3: Material = await createMaterial({ name: 'cotton' });
    const material4: Material = await createMaterial({ name: 'coffee' });
    await createMaterial({ name: 'cocoa' });

    await createSourcingLocation({
      t1SupplierId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material1.id,
    });
    await createSourcingLocation({
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.AGGREGATION_POINT,
      materialId: material2.id,
    });
    await createSourcingLocation({
      t1SupplierId: supplier1.id,
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material3.id,
    });

    await createSourcingLocation({
      t1SupplierId: supplier1.id,
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material4.id,
    });

    const response1 = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, search: 'maize' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response1.body.data.length).toEqual(1);
    expect(response1.body.data[0].attributes.materialName).toEqual(
      material2.name,
    );

    const response2 = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, search: 'co' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response2.body.data.length).toEqual(2);
    expect(response2.body.data[0].attributes.materialName).toEqual(
      material4.name,
    );
  });

  test('Getting list of materials with correct order by flag should be successful', async () => {
    const supplier1: Supplier = await createSupplier({ name: 'aSupplier' });
    const supplier2: Supplier = await createSupplier({ name: 'bSupplier' });
    const supplier3: Supplier = await createSupplier({ name: 'cSupplier' });
    const supplier4: Supplier = await createSupplier({ name: 'dSupplier' });

    const material1: Material = await createMaterial({ name: 'bananas' });
    const material2: Material = await createMaterial({ name: 'maize' });
    const material3: Material = await createMaterial({ name: 'cotton' });
    const material4: Material = await createMaterial({ name: 'coffee' });
    await createMaterial({ name: 'cocoa' });

    await createSourcingLocation({
      t1SupplierId: supplier1.id,
      producerId: supplier4.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material2.id,
      locationCountryInput: 'Brazil',
    });
    await createSourcingLocation({
      t1SupplierId: supplier4.id,
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.AGGREGATION_POINT,
      materialId: material1.id,
      locationCountryInput: 'Argentina',
    });
    await createSourcingLocation({
      t1SupplierId: supplier2.id,
      producerId: supplier3.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material3.id,
      locationCountryInput: 'Italy',
    });

    await createSourcingLocation({
      t1SupplierId: supplier3.id,
      producerId: supplier2.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material4.id,
      locationCountryInput: 'Spain',
    });

    // Order by country name
    const response1 = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, orderBy: 'country' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response1.body.data.length).toEqual(4);
    expect(response1.body.data[0].attributes.materialName).toEqual(
      material1.name,
    );
    expect(response1.body.data[1].attributes.materialName).toEqual(
      material2.name,
    );
    expect(response1.body.data[2].attributes.materialName).toEqual(
      material3.name,
    );
    expect(response1.body.data[3].attributes.materialName).toEqual(
      material4.name,
    );

    // Order by supplierT1 name
    const response2 = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, orderBy: 't1Supplier' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response2.body.data[0].attributes.materialName).toEqual(
      material2.name,
    );
    expect(response2.body.data[1].attributes.materialName).toEqual(
      material3.name,
    );
    expect(response2.body.data[2].attributes.materialName).toEqual(
      material4.name,
    );
    expect(response2.body.data[3].attributes.materialName).toEqual(
      material1.name,
    );

    // Order by producer name
    const response3 = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, orderBy: 'producer' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);
    expect(response3.body.data[0].attributes.materialName).toEqual(
      material1.name,
    );
    expect(response3.body.data[1].attributes.materialName).toEqual(
      material4.name,
    );
    expect(response3.body.data[2].attributes.materialName).toEqual(
      material3.name,
    );
    expect(response3.body.data[3].attributes.materialName).toEqual(
      material2.name,
    );
  });

  test('Getting list of materials with order by flag applied to incorrect column should return proper error message', async () => {
    const supplier1: Supplier = await createSupplier({ name: 'aSupplier' });

    const material1: Material = await createMaterial({ name: 'bananas' });

    await createSourcingLocation({
      t1SupplierId: supplier1.id,
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material1.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-locations`)
      .query({ materialsData: true, orderBy: 'purcahses' })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'Available columns for orderBy: country, businessUnit, producer, t1Supplier, material, locationType',
      ],
    );
  });
});
