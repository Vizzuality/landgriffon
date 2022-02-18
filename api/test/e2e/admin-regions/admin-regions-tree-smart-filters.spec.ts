import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import {
  createAdminRegion,
  createMaterial,
  createSourcingLocation,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Material } from 'modules/materials/material.entity';

describe('Admin Regions - Get trees - Smart Filters', () => {
  let app: INestApplication;
  let supplierRepository: SupplierRepository;
  let sourcingLocationsRepository: SourcingLocationRepository;
  let businessUnitRepository: BusinessUnitRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, BusinessUnitsModule],
    }).compile();

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    sourcingLocationsRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await supplierRepository.delete({});
    await businessUnitRepository.delete({});
    await sourcingLocationsRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test(
    'When I query a Admin Region Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related Material or Materials' +
      'Then I should receive a tree list of Business Units where there are sourcing-locations for',
    async () => {
      const parentAdminRegion1: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion',
      });

      const childAdminRegion1: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion',
        parent: parentAdminRegion1,
      });

      const material1: Material = await createMaterial({ name: 'material1' });

      const parentAdminRegion2: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion2',
      });

      const childAdminRegion2: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion2',
        parent: parentAdminRegion2,
      });

      const material2: Material = await createMaterial({ name: 'material2' });

      const parentAdminRegion3: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion3',
      });

      const childAdminRegion3: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion3',
        parent: parentAdminRegion3,
      });

      const material3: Material = await createMaterial({ name: 'material3' });

      await createSourcingLocation({
        adminRegionId: childAdminRegion1.id,
        materialId: material1.id,
      });

      await createSourcingLocation({
        adminRegionId: childAdminRegion2.id,
        materialId: material2.id,
      });

      await createSourcingLocation({
        adminRegionId: childAdminRegion3.id,
        materialId: material3.id,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin-regions/trees')
        .query({
          withSourcingLocations: true,
          'materialIds[]': [material1.id, material2.id],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentAdminRegion1.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childAdminRegion1.name,
      );
      expect(response.body.data[1].id).toEqual(parentAdminRegion2.id);
      expect(response.body.data[1].attributes.children[0].name).toEqual(
        childAdminRegion2.name,
      );
      expect(
        response.body.data.find(
          (adminRegion: AdminRegion) =>
            adminRegion.id === parentAdminRegion3.id,
        ),
      ).toBe(undefined);
    },
  );
});
