import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import {
  createAdminRegion,
  createBusinessUnit,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { DataSource } from 'typeorm';
import { Scenario } from '../../../src/modules/scenarios/scenario.entity';

describe('SourcingLocationsModule (e2e)', () => {
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
      Material,
      BusinessUnit,
      AdminRegion,
      Supplier,
      Scenario,
      ScenarioIntervention,
      SourcingLocation,
    ]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Sourcing locations - No filters', () => {
    test('Given there are Sourcing Locations with Location Types in the Database, When I request the available location Types, Then I should get results in the correct format ', async () => {
      await Promise.all(
        Object.values(LOCATION_TYPES).map(
          async (locationType: LOCATION_TYPES) => {
            await createSourcingLocation({ locationType });
            await createSourcingLocation({ locationType });
          },
        ),
      );

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/sourcing-locations/location-types`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toEqual(6);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
          {
            label: 'Point of production',
            value: `${LOCATION_TYPES.POINT_OF_PRODUCTION}`,
          },
          { label: 'Unknown', value: 'unknown' },
          {
            label: 'Administrative region of production',
            value: `${LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION}`,
          },
          {
            label: 'Country of delivery',
            value: `${LOCATION_TYPES.COUNTRY_OF_DELIVERY}`,
          },
        ]),
      );
    });
  });

  describe('Sourcing locations - Smart Filters', () => {
    test('Given there are Sourcing Locations with Location Types in the Database, When I request the available location Types with additional filters, Then I should get Location Types in accordance with filters', async () => {
      // Creating pre-conditions - Materials, Suppliers, Admin Regions, Business Units

      const parentMaterial: Material = await createMaterial();
      const childMaterialOne: Material = await createMaterial({
        parent: parentMaterial,
      });
      const childMaterialTwo: Material = await createMaterial({
        parent: parentMaterial,
      });

      const supplierOne: Supplier = await createSupplier();
      const supplierTwo: Supplier = await createSupplier();

      const adminRegionOne: AdminRegion = await createAdminRegion();
      const adminRegionTwo: AdminRegion = await createAdminRegion();

      const businessUnitOne: BusinessUnit = await createBusinessUnit();
      const businessUnitTwo: BusinessUnit = await createBusinessUnit();

      // Creating pre-conditions - Sourcing Locations

      await createSourcingLocation({
        locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
        materialId: parentMaterial.id,
        t1SupplierId: supplierOne.id,
        adminRegionId: adminRegionOne.id,
        businessUnitId: businessUnitOne.id,
      });

      await createSourcingLocation({
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        materialId: childMaterialOne.id,
        t1SupplierId: supplierOne.id,
        adminRegionId: adminRegionOne.id,
        businessUnitId: businessUnitOne.id,
      });

      await createSourcingLocation({
        locationType: LOCATION_TYPES.UNKNOWN,
        materialId: childMaterialTwo.id,
        t1SupplierId: supplierTwo.id,
        adminRegionId: adminRegionOne.id,
        businessUnitId: businessUnitOne.id,
      });

      await createSourcingLocation({
        locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
        materialId: childMaterialTwo.id,
        t1SupplierId: supplierTwo.id,
        adminRegionId: adminRegionTwo.id,
        businessUnitId: businessUnitTwo.id,
      });

      // Materials Filters

      const responseParentMaterialFilter = await request(
        testApplication.getHttpServer(),
      )
        .get(`/api/v1/sourcing-locations/location-types`)
        .query({ 'materialIds[]': parentMaterial.id })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(responseParentMaterialFilter.body.data.length).toEqual(4);
      expect(responseParentMaterialFilter.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
          {
            label: 'Point of production',
            value: `${LOCATION_TYPES.POINT_OF_PRODUCTION}`,
          },
          { label: 'Unknown', value: `${LOCATION_TYPES.UNKNOWN}` },
        ]),
      );

      const responseChildMaterialFilter = await request(
        testApplication.getHttpServer(),
      )
        .get(`/api/v1/sourcing-locations/location-types`)
        .query({ 'materialIds[]': childMaterialTwo.id })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(responseChildMaterialFilter.body.data.length).toEqual(2);
      expect(responseChildMaterialFilter.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Point of production',
            value: `${LOCATION_TYPES.POINT_OF_PRODUCTION}`,
          },
          { label: 'Unknown', value: `${LOCATION_TYPES.UNKNOWN}` },
        ]),
      );

      // Supplier filter

      const responseSupplierFilter = await request(
        testApplication.getHttpServer(),
      )
        .get(`/api/v1/sourcing-locations/location-types`)
        .query({
          'supplierIds[]': supplierOne.id,
        })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(responseSupplierFilter.body.data.length).toEqual(2);
      expect(responseSupplierFilter.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
        ]),
      );

      // Business Unit Filter

      const responseBusinessUnitFilter = await request(
        testApplication.getHttpServer(),
      )
        .get(`/api/v1/sourcing-locations/location-types`)
        .query({
          'businessUnitIds[]': businessUnitOne.id,
        })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(responseBusinessUnitFilter.body.data.length).toEqual(3);
      expect(responseBusinessUnitFilter.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
          { label: 'Unknown', value: `${LOCATION_TYPES.UNKNOWN}` },
        ]),
      );

      // Mixed Filter

      const responseMixedFilter = await request(testApplication.getHttpServer())
        .get(`/api/v1/sourcing-locations/location-types`)
        .query({
          'materialIds[]': childMaterialTwo.id,
          'originIds[]': adminRegionTwo.id,
        })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(responseMixedFilter.body.data.length).toEqual(1);
      expect(responseMixedFilter.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Point of production',
            value: `${LOCATION_TYPES.POINT_OF_PRODUCTION}`,
          },
        ]),
      );
    });
  });

  describe('Supported Location Types', () => {
    // TODO: deprecated tests: delete when /location-types/supported endpoint is removed
    test('When I query the API for all location types, Then I should get a list of all location types supported by the platform', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/sourcing-locations/location-types/supported`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
          {
            label: 'Point of production',
            value: `${LOCATION_TYPES.POINT_OF_PRODUCTION}`,
          },
          { label: 'Unknown', value: 'unknown' },
          {
            label: 'Administrative region of production',
            value: `${LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION}`,
          },
          {
            label: 'Country of delivery',
            value: `${LOCATION_TYPES.COUNTRY_OF_DELIVERY}`,
          },
        ]),
      );
    });
    test(
      'When I query the API for location types' +
        'And I add the supported: true flag' +
        'Then I should receive all supported location types' +
        'And not the only ones that are present in Sourcing Locations' +
        'And any other param should be ignored',
      async () => {
        const parentMaterial: Material = await createMaterial();
        const childMaterialOne: Material = await createMaterial({
          parent: parentMaterial,
        });
        const supplierOne: Supplier = await createSupplier();
        const adminRegionOne: AdminRegion = await createAdminRegion();
        const businessUnitOne: BusinessUnit = await createBusinessUnit();
        await createSourcingLocation({
          locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          materialId: parentMaterial.id,
          t1SupplierId: supplierOne.id,
          adminRegionId: adminRegionOne.id,
          businessUnitId: businessUnitOne.id,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: childMaterialOne.id,
          t1SupplierId: supplierOne.id,
          adminRegionId: adminRegionOne.id,
          businessUnitId: businessUnitOne.id,
        });
        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/sourcing-locations/location-types')
          .query({
            'materialIds[]': [parentMaterial.id],
            'supplierIds[]': [supplierOne.id],
            supported: true,
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.body.data).not.toHaveLength(2);
        expect(response.body.data).toHaveLength(
          Object.keys(LOCATION_TYPES).length,
        );
      },
    );
  });
  describe('Location Types Smart Filters - Filter by Scenario', () => {
    // TODO: We have to deprecate scenarioId param in favour of scenarioIds[]
    test(
      'When I query a Location Types endpoint ' +
        'And I filter them by Scenario' +
        'And I filter it by a Material and a Origin' +
        'Then I should receive location types from actual data and those that are present in some intervention of said Scenario',
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
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          scenarioInterventionId: intervention.id,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          scenarioInterventionId: intervention.id,
        });

        await createMaterial({
          name: 'supplier2Material',
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          materialId: childMaterial1.id,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/sourcing-locations/location-types')
          .query({
            scenarioId: scenario.id,
          })
          .set('Authorization', `Bearer ${jwtToken}`);
        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(3);
        expect(
          response.body.data.sort(
            (a: Record<string, any>, b: Record<string, any>) =>
              a.label < b.label ? -1 : a > b ? 1 : 0,
          ),
        ).toEqual([
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
          { label: 'Unknown', value: 'unknown' },
        ]);
      },
    );

    test(
      'When I query a Location Types endpoint ' +
        'And I filter them by multiple Scenarios' +
        'Then I should receive location types from actual data and those that are present in some intervention of said Scenario',
      async () => {
        const parentMaterial1: Material = await createMaterial({
          name: 'parentMaterial1',
        });

        const childMaterial1: Material = await createMaterial({
          name: 'childMaterial1',
          parentId: parentMaterial1.id,
        });

        const scenario = await createScenario();
        const scenario2 = await createScenario();

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
        const intervention2 = await createScenarioIntervention({
          scenario: scenario2,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          scenarioInterventionId: intervention.id,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          scenarioInterventionId: intervention.id,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
          scenarioInterventionId: intervention2.id,
        });

        await createMaterial({
          name: 'supplier2Material',
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          materialId: childMaterial1.id,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/sourcing-locations/location-types')
          .query({
            'scenarioIds[]': [scenario.id, scenario2.id],
          })
          .set('Authorization', `Bearer ${jwtToken}`);
        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(4);
        expect(
          response.body.data.sort(
            (a: Record<string, any>, b: Record<string, any>) =>
              a.label < b.label ? -1 : a > b ? 1 : 0,
          ),
        ).toEqual([
          {
            label: 'Administrative region of production',
            value: `${LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION}`,
          },
          {
            label: 'Country of production',
            value: `${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
          { label: 'Unknown', value: 'unknown' },
        ]);
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

        const adminRegionThatShouldShowResults = await createAdminRegion();
        const adminRegionThatShouldNOTShowResults = await createAdminRegion();
        const supplierThatShouldShowResults = await createSupplier();
        const supplierThatShouldNOTShowResults = await createSupplier();

        const intervention = await createScenarioIntervention({
          scenario,
        });

        await createSourcingLocation({
          materialId: childMaterial2.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          adminRegion: adminRegionThatShouldShowResults,
          t1Supplier: supplierThatShouldShowResults,
          scenarioInterventionId: intervention.id,
        });

        const material2: Material = await createMaterial({
          name: 'supplier2Material',
        });

        const material3: Material = await createMaterial({
          name: 'supplier3Material',
        });
        await createSourcingLocation({
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          materialId: childMaterial1.id,
          adminRegion: adminRegionThatShouldShowResults,
          t1Supplier: supplierThatShouldShowResults,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          materialId: material2.id,
          adminRegion: adminRegionThatShouldNOTShowResults,
          producer: supplierThatShouldNOTShowResults,
        });

        await createSourcingLocation({
          locationType: LOCATION_TYPES.UNKNOWN,
          materialId: material3.id,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/sourcing-locations/location-types')
          .query({
            scenarioId: scenario.id,
            'originIds[]': [adminRegionThatShouldShowResults.id],
            'supplierIds[]': [supplierThatShouldShowResults.id],
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.data).toEqualArrayUnordered([
          {
            label: 'Point of production',
            value: `${LOCATION_TYPES.POINT_OF_PRODUCTION}`,
          },
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
        ]);
      },
    );

    test(
      'When I query a Location Types endpoint ' +
        'And I filter them by Scenario' +
        'Then I should receive location types from actual data and those that are present in some intervention with status ACTIVE, of said Scenario',
      async () => {
        const baseMaterial: Material = await createMaterial();

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
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          scenarioInterventionId: intervention.id,
        });

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: interventionInactive.id,
        });

        const response = await request(testApplication.getHttpServer())
          .get('/api/v1/sourcing-locations/location-types')
          .query({
            scenarioId: scenario.id,
          })
          .set('Authorization', `Bearer ${jwtToken}`);
        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data).toEqual([
          {
            label: 'Production aggregation point',
            value: `${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}`,
          },
        ]);
      },
    );
  });
});
