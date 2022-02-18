import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import {
  createMaterial,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { MaterialRepository } from 'modules/materials/material.repository';

describe('Materials - Get trees - Smart Filters', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;
  let sourcingLocationsRepository: SourcingLocationRepository;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    sourcingLocationsRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await supplierRepository.delete({});
    await materialRepository.delete({});
    await sourcingLocationsRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test(
    'When I query a Supplier Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related supplier or suppliers' +
      'Then I should receive a tree list of materials where there are sourcing-locations for',
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

      const parentMaterial1: Material = await createMaterial({
        name: 'parentMaterial1',
      });

      const childMaterial1: Material = await createMaterial({
        name: 'childMaterial1',
        parentId: parentMaterial1.id,
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
        materialId: childMaterial1.id,
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
        .get('/api/v1/materials/trees')
        .query({
          withSourcingLocations: true,
          'supplierIds[]': [
            childSupplierWithRelatedMaterial.id,
            supplierWithRelatedMaterial3.id,
          ],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      console.log(JSON.stringify(response.body.data));

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentMaterial1.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childMaterial1.name,
      );
      expect(response.body.data[1].id).toEqual(material3.id);
      expect(
        response.body.data.find(
          (material: Supplier) => material.id === material2.id,
        ),
      ).toBe(undefined);
    },
  );
});
