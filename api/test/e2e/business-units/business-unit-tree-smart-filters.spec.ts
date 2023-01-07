import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createAdminRegion,
  createBusinessUnit,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import { Material } from 'modules/materials/material.entity';
import { SCENARIO_INTERVENTION_STATUS } from 'modules/scenario-interventions/scenario-intervention.entity';
import { DataSource } from 'typeorm';

describe('Business Units - Get trees - Smart Filters', () => {
  let app: INestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
      Supplier,
      BusinessUnit,
      SourcingLocation,
    ]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
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
          'locationTypes[]': [LOCATION_TYPES.UNKNOWN],
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
  describe('Business Units Smart Filters - Filter by Scenario', () => {
    test(
      'When I query a Business Unit Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'And I filter them by a related Location Types' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention of said Scenario',
      async () => {
        const baseMaterial = await createMaterial();
        const parentAdminRegion: AdminRegion = await createAdminRegion({
          name: 'Parent Admin Region',
        });

        const scenario = await createScenario();

        const parentAdminRegion2 = await createAdminRegion({
          name: 'parent of a child admin region that is not part of intervention1',
        });

        const intervention = await createScenarioIntervention({
          scenario,
        });

        const parentBusinessUnit = await createBusinessUnit();
        const childBusinessUnit = await createBusinessUnit({
          parent: parentBusinessUnit,
        });
        const businessUnitThatShouldNotAppear = await createBusinessUnit();

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: intervention.id,
          adminRegion: parentAdminRegion,
          businessUnit: childBusinessUnit,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: baseMaterial.id,
          adminRegion: parentAdminRegion2,
          businessUnit: businessUnitThatShouldNotAppear,
        });

        const response = await request(app.getHttpServer())
          .get('/api/v1/business-units/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
            'locationTypes[]': [LOCATION_TYPES.POINT_OF_PRODUCTION],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentBusinessUnit.id);
        expect(response.body.data[0].attributes.children[0].id).toEqual(
          childBusinessUnit.id,
        );
      },
    );
    test(
      'When I query a Business Unit Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'And I filter them by a some Material and Supplier' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention of said Scenario, matching said filters',
      async () => {
        const parentMaterial1: Material = await createMaterial({
          name: 'parentMaterial1',
        });

        const childMaterial1: Material = await createMaterial({
          name: 'childMaterial1',
          parent: parentMaterial1,
        });

        const scenario = await createScenario({
          title: 'Scenario For this test',
        });

        const intervention = await createScenarioIntervention({
          scenario,
        });

        const parentMaterial2 = await createMaterial({
          name: 'parent of a child material that is not part of intervention1',
        });
        const childMaterial2 = await createMaterial({
          name: 'child material that is part of a intervention',
          parent: parentMaterial2,
        });

        const parentBusinessUnit = await createBusinessUnit();
        const childBusinessUnit = await createBusinessUnit({
          parent: parentBusinessUnit,
        });
        const businessUnitThatShouldNotAppear = await createBusinessUnit();

        const adminRegion = await createAdminRegion({
          name: 'AdminRegionThatShouldShown',
        });
        const adminRegion2 = await createAdminRegion({
          name: 'AdminRegionThatShouldShown 2',
        });
        const adminRegions3 = await createAdminRegion({
          name: 'AdminRegionThatShouldNotShown',
        });
        const supplier = await createSupplier();

        await createSourcingLocation({
          material: childMaterial1,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          adminRegion,
          t1Supplier: supplier,
          scenarioInterventionId: intervention.id,
          businessUnit: childBusinessUnit,
        });

        const material2: Material = await createMaterial({
          name: 'supplier2Material',
        });

        const material3: Material = await createMaterial({
          name: 'supplier3Material',
        });
        await createSourcingLocation({
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          material: childMaterial2,
          adminRegion: adminRegion2,
          t1Supplier: supplier,
          businessUnit: childBusinessUnit,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: material2.id,
          adminRegion: adminRegions3,
          businessUnit: businessUnitThatShouldNotAppear,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
          materialId: material3.id,
          adminRegion: adminRegion2,
        });

        const response = await request(app.getHttpServer())
          .get('/api/v1/business-units/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
            'materialIds[]': [parentMaterial1.id, parentMaterial2.id],
            'supplierIds[]': [supplier.id],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentBusinessUnit.id);
        expect(response.body.data[0].attributes.children[0].id).toEqual(
          childBusinessUnit.id,
        );
        expect(
          response.body.data.find(
            (business: BusinessUnit) =>
              business.id === businessUnitThatShouldNotAppear.id,
          ),
        ).toBe(undefined);
      },
    );

    test(
      'When I query a Business Unit Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention with status ACTIVE, of said Scenario',
      async () => {
        const baseMaterial = await createMaterial();
        const parentAdminRegion: AdminRegion = await createAdminRegion({
          name: 'Parent Admin Region',
        });

        const scenario = await createScenario();
        const intervention = await createScenarioIntervention({
          scenario,
        });
        const interventionInactive = await createScenarioIntervention({
          scenario,
          status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
        });

        const parentBusinessUnit = await createBusinessUnit();
        const childBusinessUnit = await createBusinessUnit({
          parent: parentBusinessUnit,
        });
        const businessUnitInactive = await createBusinessUnit();

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: intervention.id,
          adminRegion: parentAdminRegion,
          businessUnit: childBusinessUnit,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          materialId: baseMaterial.id,
          scenarioInterventionId: interventionInactive.id,
          adminRegion: parentAdminRegion,
          businessUnit: businessUnitInactive,
        });

        const response = await request(app.getHttpServer())
          .get('/api/v1/business-units/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentBusinessUnit.id);
        expect(response.body.data[0].attributes.children[0].id).toEqual(
          childBusinessUnit.id,
        );
      },
    );
  });
});
