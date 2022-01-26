import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createAdminRegion,
  createH3Data,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
} from '../../entity-mocks';

import { ImpactModule } from 'modules/impact/impact.module';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';

describe('Impact Trees test suite (e2e)', () => {
  let app: INestApplication;
  let materialRepository: MaterialRepository;
  let adminRegionRepository: AdminRegionRepository;
  let h3dataRepository: H3DataRepository;
  let materialToH3Service: MaterialsToH3sService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImpactModule],
    }).compile();

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    materialToH3Service = moduleFixture.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    h3dataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
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
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3dataRepository.delete({});
    await adminRegionRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test(
    'When I query a Impact Material Tree endpoint' +
      'Then I should receive a tree list of materials imported by a user' +
      'And if any of them is a child material, I should get its parent too',
    async () => {
      const h3Data: H3Data = await createH3Data();

      const parentMaterial: Material = await createMaterial({
        name: 'parentMaterial',
      });
      await createMaterialToH3(
        parentMaterial.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      const childMaterial1: Material = await createMaterial({
        name: 'childMaterial',
        parent: parentMaterial,
      });
      await createMaterialToH3(
        childMaterial1.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
      const parentWithNoChildMaterial: Material = await createMaterial({
        name: 'parentWithNoChild',
      });
      await createMaterialToH3(
        parentWithNoChildMaterial.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

      const materialNotPresentInSourcingLocations: Material =
        await createMaterial({ name: 'materialNotPresentInSourcingLocations' });
      await createMaterialToH3(
        materialNotPresentInSourcingLocations.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

      for await (const material of [
        childMaterial1,
        parentWithNoChildMaterial,
      ]) {
        await createSourcingLocation({ materialId: material.id });
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/materials')
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(parentMaterial.id);
      expect(response.body.data[0].attributes.children[0].id).toEqual(
        childMaterial1.id,
      );
      expect(response.body.data[1].id).toEqual(parentWithNoChildMaterial.id);
      expect(response.body.data[1].attributes.children).toEqual([]);
      expect(
        response.body.data.find(
          (material: Material) =>
            material.id === materialNotPresentInSourcingLocations.id,
        ),
      ).toBe(undefined);
    },
  );
  test(
    'When I query a Impact Admin-Region Tree endpoint' +
      'Then I should receive a tree list of admin imported where sourcing locations of the user are' +
      'And if any of them is a child admin-region, I should get its parent too',
    async () => {
      const parentAdminRegion: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion',
      });
      const childAdminRegion: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion',
        parent: parentAdminRegion,
      });

      const parentWithNoChildAdminRegion: AdminRegion = await createAdminRegion(
        {
          name: 'parentWithNoChild',
        },
      );
      const adminRegionNotPresentInSourcingLocations: AdminRegion =
        await createAdminRegion({
          name: 'adminRegionNotPresentInSourcingLocations',
        });

      for await (const adminRegion of [
        childAdminRegion,
        parentWithNoChildAdminRegion,
      ]) {
        await createSourcingLocation({ adminRegionId: adminRegion.id });
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/impact/admin-regions')
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(parentAdminRegion.id);
      expect(response.body.data[0].attributes.children[0].id).toEqual(
        childAdminRegion.id,
      );
      expect(response.body.data[1].id).toEqual(parentWithNoChildAdminRegion.id);
      expect(response.body.data[1].attributes.children).toEqual([]);
      expect(
        response.body.data.find(
          (material: Material) =>
            material.id === adminRegionNotPresentInSourcingLocations.id,
        ),
      ).toBe(undefined);
    },
  );
});
