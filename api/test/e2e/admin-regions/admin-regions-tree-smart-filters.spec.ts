import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createAdminRegion,
  createMaterial,
  createSourcingLocation,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Material } from 'modules/materials/material.entity';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { clearEntityTables } from '../../utils/database-test-helper';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';

describe('Admin Regions - Get trees - Smart Filters', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, BusinessUnitsModule],
    }).compile();

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await clearEntityTables([Supplier, BusinessUnit, SourcingLocation]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('When I request admin region trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .query({
        withSourcingLocations: true,
      })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toStrictEqual([]);
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

  test.skip(
    'When I query a Admin Region Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related Location Types' +
      'Then I should receive a tree list of Business Units where there are sourcing-locations for',
    async () => {
      const parentAdminRegion1: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion',
      });

      const childAdminRegion1: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion',
        parent: parentAdminRegion1,
      });

      const parentAdminRegion2: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion2',
      });

      const childAdminRegion2: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion2',
        parent: parentAdminRegion2,
      });

      const parentAdminRegion3: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion3',
      });

      const childAdminRegion3: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion3',
        parent: parentAdminRegion3,
      });

      await createSourcingLocation({
        adminRegionId: childAdminRegion1.id,
        locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
      });

      await createSourcingLocation({
        adminRegionId: childAdminRegion2.id,
        locationType: LOCATION_TYPES.AGGREGATION_POINT,
      });

      await createSourcingLocation({
        adminRegionId: childAdminRegion3.id,
        locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin-regions/trees')
        .query({
          withSourcingLocations: true,
          'locationTypes[]': [
            LOCATION_TYPES_PARAMS.COUNTRY_OF_PRODUCTION,
            LOCATION_TYPES_PARAMS.AGGREGATION_POINT,
          ],
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
