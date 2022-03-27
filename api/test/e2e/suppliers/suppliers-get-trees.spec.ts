import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { createSourcingLocation, createSupplier } from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Material } from 'modules/materials/material.entity';

describe('Suppliers - Get trees', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SuppliersModule],
    }).compile();

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await supplierRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
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
      .set('Authorization', `Bearer ${jwtToken}`)
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
      .set('Authorization', `Bearer ${jwtToken}`)
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
      .set('Authorization', `Bearer ${jwtToken}`)
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
      .set('Authorization', `Bearer ${jwtToken}`)
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

  test(
    'When I query a Supplier Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'Then I should receive a tree list of suppliers where there are sourcing-locations for' +
      'And if any of them is a child supplier, I should get its parent too',
    async () => {
      const parentSupplier: Supplier = await createSupplier({
        name: 'parentSupplier',
      });
      const childSupplier: Supplier = await createSupplier({
        name: 'childSupplier',
        parent: parentSupplier,
      });

      const parentWithNoChildSupplier: Supplier = await createSupplier({
        name: 'parentWithNoChild',
      });
      const supplierNotPresentInSourcingLocations: Supplier =
        await createSupplier({
          name: 'adminRegionNotPresentInSourcingLocations',
        });

      for await (const supplier of [childSupplier, parentWithNoChildSupplier]) {
        await createSourcingLocation({
          t1SupplierId: supplier.id,
          producerId: supplier.id,
        });
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/suppliers/trees')
        .query({ withSourcingLocations: true })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data[1].id).toEqual(parentWithNoChildSupplier.id);
      expect(response.body.data[1].attributes.children).toEqual([]);
      expect(response.body.data[0].id).toEqual(parentSupplier.id);
      expect(response.body.data[0].attributes.children[0].id).toEqual(
        childSupplier.id,
      );
      expect(
        response.body.data.find(
          (material: Material) =>
            material.id === supplierNotPresentInSourcingLocations.id,
        ),
      ).toBe(undefined);
    },
  );
});
