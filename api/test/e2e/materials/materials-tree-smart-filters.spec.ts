import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  createAdminRegion,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
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
import {
  INTERVENTION_STATUS,
  Intervention,
} from 'modules/interventions/intervention.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { DataSource } from 'typeorm';

describe('Materials - Get trees - Smart Filters', () => {
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [
      Scenario,
      Intervention,
      Supplier,
      Material,
      SourcingLocation,
    ]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I request material trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .query({
        withSourcingLocations: true,
      })
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toStrictEqual([]);
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

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/materials/trees')
        .query({
          withSourcingLocations: true,
          'supplierIds[]': [
            childSupplierWithRelatedMaterial.id,
            supplierWithRelatedMaterial3.id,
          ],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

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

  test(
    'When I query a Material Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I include the ones that are part of a Scenario' +
      'Then I should receive a tree list of materials where there are sourcing-locations for',
    async () => {
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

      const material3: Material = await createMaterial({
        name: 'supplier3Material',
      });
      await createSourcingLocation({
        locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
        materialId: childMaterial1.id,
      });

      await createSourcingLocation({
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        materialId: material2.id,
      });

      await createSourcingLocation({
        locationType: LOCATION_TYPES.UNKNOWN,
        materialId: material3.id,
      });

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/materials/trees')
        .query({
          withSourcingLocations: true,
          'locationTypes[]': [
            LOCATION_TYPES.POINT_OF_PRODUCTION,
            LOCATION_TYPES.UNKNOWN,
          ],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

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

  describe('Material Smart Filters - Filter by Scenario', () => {
    test(
      'When I query a Material Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'And I filter them by a related Location Types' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention of said Scenario',
      async () => {
        const parentMaterial1: Material = await createMaterial({
          name: 'parentMaterial1',
        });

        const childMaterial1: Material = await createMaterial({
          name: 'childMaterial1',
          parentId: parentMaterial1.id,
        });

        const scenario = await createScenario();

        const parentMaterial2 = await createMaterial({
          name: 'parent of a child material that is not part of intervention1',
        });
        const childMaterial2 = await createMaterial({
          name: 'child material that is part of a intervention',
          parent: parentMaterial2,
        });

        const intervention = await createScenarioIntervention({
          scenario,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
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
          materialId: childMaterial1.id,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: material2.id,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
          materialId: material3.id,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/materials/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
            'locationTypes[]': [LOCATION_TYPES.POINT_OF_PRODUCTION],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].id).toEqual(parentMaterial1.id);
        expect(response.body.data[0].attributes.children[0].name).toEqual(
          childMaterial1.name,
        );
        expect(response.body.data[1].id).toEqual(parentMaterial2.id);
        expect(response.body.data[1].attributes.children[0].name).toEqual(
          childMaterial2.name,
        );
        expect(
          response.body.data.find(
            (material: Material) => material.id === material2.id,
          ),
        ).toBe(undefined);
        expect(
          response.body.data.find(
            (material: Material) => material.id === material3.id,
          ),
        ).toBe(undefined);
      },
    );

    test(
      'When I query a Material Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'And I filter them by a some Origin and Supplier' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention of said Scenario, matching said filters',
      async () => {
        const parentMaterial1: Material = await createMaterial({
          name: 'parentMaterial1',
        });

        const childMaterial1: Material = await createMaterial({
          name: 'childMaterial1',
          parentId: parentMaterial1.id,
        });

        const scenario = await createScenario();

        const parentMaterial2 = await createMaterial({
          name: 'parent of a child material that is not part of intervention1',
        });
        const childMaterial2 = await createMaterial({
          name: 'child material that is part of a intervention',
          parent: parentMaterial2,
        });

        const adminRegion = await createAdminRegion();
        const supplier = await createSupplier();

        const intervention = await createScenarioIntervention({
          scenario,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
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
          materialId: childMaterial1.id,
          adminRegion,
          t1Supplier: supplier,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: material2.id,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
          materialId: material3.id,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/materials/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
            'originIds[]': [adminRegion.id],
            'supplierIds[]': [supplier.id],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].id).toEqual(parentMaterial1.id);
        expect(response.body.data[0].attributes.children[0].name).toEqual(
          childMaterial1.name,
        );
        expect(response.body.data[1].id).toEqual(parentMaterial2.id);
        expect(response.body.data[1].attributes.children[0].name).toEqual(
          childMaterial2.name,
        );
        expect(
          response.body.data.find(
            (material: Material) => material.id === material2.id,
          ),
        ).toBe(undefined);
        expect(
          response.body.data.find(
            (material: Material) => material.id === material3.id,
          ),
        ).toBe(undefined);
      },
    );

    test(
      'When I query a Material Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'Then I should receive a tree list of materials where there are sourcing-locations for, and are present in some intervention with status ACTIVE, of said Scenario',
      async () => {
        const parentMaterial1: Material = await createMaterial({
          name: 'parentMaterial1',
        });

        const childMaterial1: Material = await createMaterial({
          name: 'childMaterial1',
          parentId: parentMaterial1.id,
        });

        const parentMaterial2 = await createMaterial({
          name: 'parentMaterial2',
        });
        const childMaterial2 = await createMaterial({
          name: 'child material that is part of a inactive intervention',
          parent: parentMaterial2,
        });

        const scenario = await createScenario();
        const intervention = await createScenarioIntervention({
          scenario,
        });
        const interventionInactive = await createScenarioIntervention({
          scenario,
          status: INTERVENTION_STATUS.INACTIVE,
        });

        await createSourcingLocation({
          materialId: childMaterial1.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: intervention.id,
        });

        await createSourcingLocation({
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          materialId: childMaterial2.id,
          scenarioInterventionId: interventionInactive.id,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/materials/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentMaterial1.id);
        expect(response.body.data[0].attributes.children[0].name).toEqual(
          childMaterial1.name,
        );
      },
    );
  });
});
