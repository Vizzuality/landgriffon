import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import {
  createAdminRegion,
  createBusinessUnit,
  createSourcingLocation,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';

describe('Materials - Get trees - Smart Filters', () => {
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
});
