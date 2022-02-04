import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import {
  createMaterial,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

describe('Materials - Get the list of Materials uploaded by User with details', () => {
  let app: INestApplication;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('Getting list of materials uploaded by users (and being part of sourcing locations) should be successful with default pagination', async () => {
    // Creating varios materials and suppliers for sourcing locations:
    const supplier1: Supplier = await createSupplier();
    const supplier2: Supplier = await createSupplier();

    const material1: Material = await createMaterial({ name: 'bananas' });
    const material2: Material = await createMaterial({ name: 'maize' });
    const material3: Material = await createMaterial({ name: 'cotton' });

    // Creating sourcing locations for different materials and suppliers
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
      t1SupplierId: supplier2.id,
      producerId: supplier1.id,
      locationType: LOCATION_TYPES.UNKNOWN,
      materialId: material3.id,
    });

    const responseWithDefaultPagination = await request(app.getHttpServer())
      .get(`/api/v1/materials/materials-list`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    const responseWithCustomPagination = await request(app.getHttpServer())
      .get(`/api/v1/materials/materials-list?page[size]=2`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(responseWithDefaultPagination.body.data[0].attributes.name).toEqual(
      'bananas',
    );
    expect(
      responseWithDefaultPagination.body.data[1].attributes.supplier,
    ).toEqual(supplier2.name);
    expect(responseWithDefaultPagination.body.data[2].attributes.name).toEqual(
      'maize',
    );
    expect(responseWithDefaultPagination.body.meta.size).toEqual(25);
    expect(responseWithDefaultPagination.body.meta.totalItems).toEqual(3);
    expect(responseWithDefaultPagination.body.meta.totalPages).toEqual(1);

    expect(responseWithCustomPagination.body.meta.size).toEqual(2);
    expect(responseWithCustomPagination.body.meta.totalItems).toEqual(3);
    expect(responseWithCustomPagination.body.meta.totalPages).toEqual(2);
    expect(responseWithCustomPagination.body.data.length).toBe(2);
  });
});
