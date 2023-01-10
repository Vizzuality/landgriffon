import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import {
  createAdminRegion,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Material } from 'modules/materials/material.entity';
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { DataSource } from 'typeorm';

describe('Admin Regions - Get trees - Smart Filters', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
      Scenario,
      ScenarioIntervention,
      AdminRegion,
      Material,
      Supplier,
      BusinessUnit,
      SourcingLocation,
    ]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I request admin region trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
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

  test(
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
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      });

      await createSourcingLocation({
        adminRegionId: childAdminRegion3.id,
        locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
      });

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/admin-regions/trees')
        .query({
          withSourcingLocations: true,
          'locationTypes[]': [
            LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
            LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
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
  describe('Admin Regions Smart Filters - Filter by Scenario', () => {
    test(
      'When I query a Admin Regions Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'And I filter them by a related Location Types' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention of said Scenario',
      async () => {
        const baseMaterial = await createMaterial();
        const parentAdminRegion: AdminRegion = await createAdminRegion({
          name: 'Parent Admin Region',
        });

        const childAdminRegion: AdminRegion = await createAdminRegion({
          name: 'Child Admin Region',
          parentId: parentAdminRegion.id,
        });

        const scenario = await createScenario();

        const parentAdminRegion2 = await createAdminRegion({
          name: 'parent of a child admin region that is not part of intervention1',
        });
        const childAdminRegion2 = await createAdminRegion({
          name: 'child material that is part of a intervention',
          parent: parentAdminRegion2,
        });

        const intervention = await createScenarioIntervention({
          scenario,
        });

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: intervention.id,
          adminRegion: childAdminRegion,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: baseMaterial.id,
          adminRegion: childAdminRegion2,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/admin-regions/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
            'locationTypes[]': [LOCATION_TYPES.POINT_OF_PRODUCTION],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentAdminRegion.id);
        expect(response.body.data[0].attributes.children[0].id).toEqual(
          childAdminRegion.id,
        );
      },
    );
    test(
      'When I query a Admin Regions Tree endpoint ' +
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
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: material2.id,
          adminRegion: adminRegions3,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
          materialId: material3.id,
          adminRegion: adminRegion2,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/admin-regions/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
            'materialIds[]': [parentMaterial1.id, parentMaterial2.id],
            'supplierIds[]': [supplier.id],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(2);

        expect(response.body.data[0].id).toEqual(adminRegion.id);
        expect(response.body.data[1].id).toEqual(adminRegion2.id);

        expect(
          response.body.data.find(
            (region: AdminRegion) => region.id === adminRegions3.id,
          ),
        ).toBe(undefined);
      },
    );

    test(
      'When I query a Admin Regions Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention with status ACTIVE, of said Scenario',
      async () => {
        const baseMaterial = await createMaterial();
        const parentAdminRegion: AdminRegion = await createAdminRegion({
          name: 'Parent Admin Region',
        });

        const childAdminRegion: AdminRegion = await createAdminRegion({
          name: 'Child Admin Region',
          parentId: parentAdminRegion.id,
        });

        const parentAdminRegion2 = await createAdminRegion({
          name: 'parentAdminRegion2',
        });
        const childAdminRegion2 = await createAdminRegion({
          name: 'child material that is part of an inactive intervention',
          parent: parentAdminRegion2,
        });

        const scenario = await createScenario();

        const intervention = await createScenarioIntervention({
          scenario,
        });

        const interventionInactive = await createScenarioIntervention({
          scenario,
          status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
        });

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: intervention.id,
          adminRegion: childAdminRegion,
        });

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: interventionInactive.id,
          adminRegion: childAdminRegion2,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/admin-regions/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentAdminRegion.id);
        expect(response.body.data[0].attributes.children[0].id).toEqual(
          childAdminRegion.id,
        );
      },
    );
  });
});
