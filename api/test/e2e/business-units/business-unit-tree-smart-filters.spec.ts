import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createAdminRegion,
  createBusinessUnit,
  createSourcingLocation,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { clearEntityTables } from '../../utils/database-test-helper';

describe('Business Units - Get trees - Smart Filters', () => {
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

  test('When I request business units trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/business-units/trees`)
      .query({
        withSourcingLocations: true,
      })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toStrictEqual([]);
  });

  test(
    'When I query a Business Unit Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related Admin Region or Admin Regions' +
      'Then I should receive a tree list of Business Units where there are sourcing-locations for',
    async () => {
      const parentBusinessUnit: BusinessUnit = await createBusinessUnit({
        name: 'parentBusinessUnit',
      });
      const childBusinessUnit: BusinessUnit = await createBusinessUnit({
        name: 'childBusinessUnit',
        parent: parentBusinessUnit,
      });

      const parentBusinessUnit2: BusinessUnit = await createBusinessUnit({
        name: 'parentBusinessUnit2',
      });
      const childBusinessUnit2: BusinessUnit = await createBusinessUnit({
        name: 'childBusinessUnit2',
        parent: parentBusinessUnit2,
      });

      const adminRegion1: AdminRegion = await createAdminRegion({
        name: 'adminRegion1',
      });

      const adminRegion2: AdminRegion = await createAdminRegion({
        name: 'adminRegion2',
      });

      await createSourcingLocation({
        businessUnitId: childBusinessUnit.id,
        adminRegionId: adminRegion1.id,
      });

      await createSourcingLocation({
        businessUnitId: childBusinessUnit2.id,
        adminRegionId: adminRegion2.id,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/business-units/trees')
        .query({
          withSourcingLocations: true,
          'originIds[]': [adminRegion1.id],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentBusinessUnit.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childBusinessUnit.name,
      );
      expect(
        response.body.data.find(
          (businessUnit: BusinessUnit) =>
            businessUnit.id === parentBusinessUnit2.id,
        ),
      ).toBe(undefined);
    },
  );

  test(
    'When I query a Business Unit Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related Location Types' +
      'Then I should receive a tree list of Business Units where there are sourcing-locations for',
    async () => {
      const parentBusinessUnit: BusinessUnit = await createBusinessUnit({
        name: 'parentBusinessUnit',
      });
      const childBusinessUnit: BusinessUnit = await createBusinessUnit({
        name: 'childBusinessUnit',
        parent: parentBusinessUnit,
      });

      const parentBusinessUnit2: BusinessUnit = await createBusinessUnit({
        name: 'parentBusinessUnit2',
      });
      const childBusinessUnit2: BusinessUnit = await createBusinessUnit({
        name: 'childBusinessUnit2',
        parent: parentBusinessUnit2,
      });

      await createSourcingLocation({
        businessUnitId: childBusinessUnit.id,
        locationType: LOCATION_TYPES.UNKNOWN,
      });

      await createSourcingLocation({
        businessUnitId: childBusinessUnit2.id,
        locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/business-units/trees')
        .query({
          withSourcingLocations: true,
          'locationTypes[]': [LOCATION_TYPES_PARAMS.UNKNOWN],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentBusinessUnit.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childBusinessUnit.name,
      );
      expect(
        response.body.data.find(
          (businessUnit: BusinessUnit) =>
            businessUnit.id === parentBusinessUnit2.id,
        ),
      ).toBe(undefined);
    },
  );
});
