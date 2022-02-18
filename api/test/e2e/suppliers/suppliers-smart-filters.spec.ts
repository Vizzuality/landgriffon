import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import {
  createMaterial,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Material } from 'modules/materials/material.entity';

describe('Suppliers - Get trees - Smart Filters', () => {
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

  test(
    'When I query a Supplier Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related material or materials' +
      'Then I should receive a tree list of suppliers where there are sourcing-locations for',
    async () => {
      const parentSupplier: Supplier = await createSupplier({
        name: 'parentSupplier',
      });
      const childSupplierWithRelatedMaterial: Supplier = await createSupplier({
        name: 'childSupplierWithRelatedMaterial',
        parent: parentSupplier,
      });

      const supplier2WithRelatedMaterial: Supplier = await createSupplier({
        name: 'supplierWithRelatedMaterial2',
      });

      const material1: Material = await createMaterial({
        name: 'childSupplierMaterial',
      });

      const material2: Material = await createMaterial({
        name: 'supplier2Material',
      });

      const supplierWithRelatedMaterial3: Supplier = await createSupplier({
        name: 'supplierWithRelatedMaterial3',
      });
      const material3: Material = await createMaterial({
        name: 'supplier3Material',
      });
      await createSourcingLocation({
        t1SupplierId: childSupplierWithRelatedMaterial.id,
        materialId: material1.id,
      });

      await createSourcingLocation({
        producerId: supplier2WithRelatedMaterial.id,
        materialId: material2.id,
      });

      await createSourcingLocation({
        t1SupplierId: supplierWithRelatedMaterial3.id,
        materialId: material3.id,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/suppliers/trees')
        .query({
          withSourcingLocations: true,
          'materialIds[]': [material1.id, material2.id],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentSupplier.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childSupplierWithRelatedMaterial.name,
      );
      expect(response.body.data[1].id).toEqual(supplier2WithRelatedMaterial.id);
      expect(
        response.body.data.find(
          (supplier: Supplier) =>
            supplier.id === supplierWithRelatedMaterial3.id,
        ),
      ).toBe(undefined);
    },
  );
});
