import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import {
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { Material } from 'modules/materials/material.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SCENARIO_INTERVENTION_STATUS } from 'modules/scenario-interventions/scenario-intervention.entity';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('Suppliers - Get trees - Smart Filters', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let supplierRepository: SupplierRepository;
  let sourcingLocationsRepository: SourcingLocationRepository;
  let materialRepository: MaterialRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    sourcingLocationsRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await supplierRepository.delete({});
    await materialRepository.delete({});
    await sourcingLocationsRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });

  test('When I request suppliers trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/suppliers/trees`)
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
      'And I filter them by a related material or materials' +
      'Then I should receive a tree list of suppliers where there are sourcing-locations for',
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

      const material1: Material = await createMaterial({
        name: 'childSupplierMaterial',
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
        materialId: material1.id,
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
        .get('/api/v1/suppliers/trees')
        .query({
          withSourcingLocations: true,
          'materialIds[]': [material1.id, material2.id],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentSupplier.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childSupplierWithRelatedMaterial.name,
      );
      expect(response.body.data[1].id).toEqual(supplier2WithRelatedMaterial.id);
      expect(
        response.body.data.find(
          (supplier: Supplier) =>
            supplier.id === supplierWithRelatedMaterial3.id,
        ),
      ).toBe(undefined);
    },
  );

  test.skip(
    'When I query a Supplier Tree endpoint ' +
      'And I query the ones with sourcing locations' +
      'And I filter them by a related Location Types' +
      'Then I should receive a tree list of suppliers where there are sourcing-locations for',
    async () => {
      const parentSupplier: Supplier = await createSupplier({
        name: 'parentSupplier',
      });
      const childSupplier: Supplier = await createSupplier({
        name: 'childSupplierWithRelatedMaterial',
        parent: parentSupplier,
      });

      const supplier2: Supplier = await createSupplier({
        name: 'supplierWithRelatedMaterial2',
      });

      const supplier3: Supplier = await createSupplier({
        name: 'supplierWithRelatedMaterial3',
      });

      await createSourcingLocation({
        t1SupplierId: childSupplier.id,
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      });

      await createSourcingLocation({
        producerId: supplier2.id,
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      });

      await createSourcingLocation({
        t1SupplierId: supplier3.id,
        locationType: LOCATION_TYPES.UNKNOWN,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/suppliers/trees')
        .query({
          withSourcingLocations: true,
          'locationTypes[]': [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT],
        })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[0].id).toEqual(parentSupplier.id);
      expect(response.body.data[0].attributes.children[0].name).toEqual(
        childSupplier.name,
      );
      expect(response.body.data[1].id).toEqual(supplier2.id);
      expect(
        response.body.data.find(
          (supplier: Supplier) => supplier.id === supplier3.id,
        ),
      ).toBe(undefined);
    },
  );

  describe('Material Smart Filters - Filter by Scenario', () => {
    test(
      'When I query a Supplier Tree endpoint ' +
        'And I query the ones with sourcing locations' +
        'And I filter them by Scenario' +
        'Then I should receive a tree list of suppliers where there are sourcing-locations for, and are present in some intervention with status ACTIVE, of said Scenario',
      async () => {
        const baseMaterial: Material = await createMaterial({
          name: 'baseMaterial',
        });

        const parentSupplier: Supplier = await createSupplier({
          name: 'parentSupplier1',
        });
        const childSupplier: Supplier = await createSupplier({
          name: 'childSupplier1',
          parent: parentSupplier,
        });

        const parentSupplier2: Supplier = await createSupplier({
          name: 'parentSupplier2',
        });
        const childSupplier2: Supplier = await createSupplier({
          name: 'childSupplier2 inactive',
          parent: parentSupplier2,
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
          producerId: childSupplier.id,
        });

        await createSourcingLocation({
          materialId: baseMaterial.id,
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          scenarioInterventionId: interventionInactive.id,
          producerId: childSupplier2.id,
        });

        const response = await request(app.getHttpServer())
          .get('/api/v1/suppliers/trees')
          .query({
            withSourcingLocations: true,
            scenarioId: scenario.id,
          })
          .set('Authorization', `Bearer ${jwtToken}`);

        expect(HttpStatus.OK);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toEqual(parentSupplier.id);
        expect(response.body.data[0].attributes.children[0].name).toEqual(
          childSupplier.name,
        );
      },
    );
  });
});
