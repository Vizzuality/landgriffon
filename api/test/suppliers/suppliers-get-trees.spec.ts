import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSupplier } from '../entity-mocks';
import { expectedJSONAPIAttributes } from './config';

describe('Suppliers - Get trees', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SuppliersModule],
    }).compile();

    supplierRepository = moduleFixture.get<SupplierRepository>(
      SupplierRepository,
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
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('Get trees of suppliers should be successful (happy case)', async () => {
    const rootSupplier: Supplier = await createSupplier();
    const childOneSupplier: Supplier = await createSupplier({
      parent: rootSupplier,
    });
    const childTwoSupplier: Supplier = await createSupplier({
      parent: rootSupplier,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers/trees`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toEqual(rootSupplier.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    expect(response.body.data[0].attributes.children).toHaveLength(2);
    expect(
      response.body.data[0].attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoSupplier.id, childOneSupplier.id].sort());
  });

  test('Get trees of suppliers should return multiple trees in parallel if they exist', async () => {
    const rootOneSupplier: Supplier = await createSupplier();
    const rootTwoSupplier: Supplier = await createSupplier();
    const childOneSupplier: Supplier = await createSupplier({
      parent: rootOneSupplier,
    });
    const childTwoSupplier: Supplier = await createSupplier({
      parent: rootOneSupplier,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers/trees`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(2);
    expect(
      response.body.data.map((elem: Record<string, any>) => elem.id).sort(),
    ).toEqual([rootOneSupplier.id, rootTwoSupplier.id].sort());
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootOneSupplierFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootOneSupplier.id,
    );
    expect(rootOneSupplierFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootOneSupplierFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoSupplier.id, childOneSupplier.id].sort());
  });

  test('Get trees of suppliers filtered by depth should return trees up to the defined level of depth', async () => {
    const rootSupplier: Supplier = await createSupplier();
    const childOneSupplier: Supplier = await createSupplier({
      parent: rootSupplier,
    });
    const childTwoSupplier: Supplier = await createSupplier({
      parent: rootSupplier,
    });
    await createSupplier({
      parent: childOneSupplier,
    });
    await createSupplier({
      parent: childTwoSupplier,
    });

    const responseDepthZero = await request(app.getHttpServer())
      .get(`/api/v1/suppliers/trees`)
      .query({
        depth: 0,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseDepthZero.body.data).toHaveLength(1);
    expect(responseDepthZero.body.data[0].id).toEqual(rootSupplier.id);
    expect(responseDepthZero).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);
    expect(responseDepthZero.body.data[0].attributes.children).toEqual([]);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers/trees`)
      .query({
        depth: 1,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toEqual(rootSupplier.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootSupplierFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootSupplier.id,
    );
    expect(rootSupplierFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootSupplierFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoSupplier.id, childOneSupplier.id].sort());

    rootSupplierFromResponse.attributes.children.forEach(
      (childSupplier: Record<string, any>) => {
        expect(childSupplier.children).toEqual([]);
      },
    );
  });
});
