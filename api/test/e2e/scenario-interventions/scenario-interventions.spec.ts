import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { ScenarioInterventionsModule } from 'modules/scenario-interventions/scenario-interventions.module';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import {
  createAdminRegion,
  createBusinessUnit,
  createGeoRegion,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import {
  createInterventionPreconditions,
  ScenarioInterventionPreconditions,
} from '../../utils/scenario-interventions-preconditions';

const expectedJSONAPIAttributes: string[] = [
  'title',
  'type',
  'description',
  'status',
  'createdAt',
  'updatedAt',
];

describe('ScenarioInterventionsModule (e2e)', () => {
  const geoCodingServiceMock = {
    geoCodeLocations: async (sourcingData: any): Promise<any> => {
      const geoRegion: GeoRegion | undefined =
        await geoRegionRepository.findOne({
          name: 'ABC',
        });
      if (geoRegion === undefined) {
        throw new Error('Could not find expected mock GeoRegion with name=ABC');
      }
      const adminRegion: AdminRegion | undefined =
        await adminRegionRepository.findOne({
          geoRegionId: geoRegion.id,
        });
      if (adminRegion === undefined) {
        throw new Error(
          'Could not find expected mock AdminRegion for GeoRegion with name=ABC',
        );
      }

      return sourcingData
        .filter(
          (each: SourcingData | { locationType: '#N/A' }) =>
            each.locationType !== '#N/A',
        )
        .map((each: SourcingData) => ({
          ...each,
          adminRegionId: adminRegion.id,
          geoRegionId: geoRegion.id,
        }));
    },
  };

  let app: INestApplication;
  let scenarioInterventionRepository: ScenarioInterventionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let adminRegionRepository: AdminRegionRepository;
  let geoRegionRepository: GeoRegionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ScenarioInterventionsModule,
        SourcingLocationsModule,
        SourcingRecordsModule,
      ],
    })
      .overrideProvider(GeoCodingService)
      .useValue(geoCodingServiceMock)
      .compile();

    scenarioInterventionRepository =
      moduleFixture.get<ScenarioInterventionRepository>(
        ScenarioInterventionRepository,
      );
    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    geoRegionRepository =
      moduleFixture.get<GeoRegionRepository>(GeoRegionRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
    await sourcingRecordRepository.delete({});
    await scenarioInterventionRepository.delete({});
    await adminRegionRepository.delete({});
    await geoRegionRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario interventions - Creating intervention of type - Change of production efficiency', () => {
    test('Create a scenario intervention of type Change of production efficiency, with correct data should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditions();

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialsIds: [preconditions.material1.id],
          suppliersIds: [preconditions.supplier1.id],
          businessUnitsIds: [preconditions.businessUnit1.id],
          adminRegionsIds: [preconditions.adminRegion1.id],
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.CREATED);

      const createdScenarioIntervention =
        await scenarioInterventionRepository.findOne(response.body.data.id);

      if (!createdScenarioIntervention) {
        throw new Error('Error loading created Scenario intervention');
      }

      expect(createdScenarioIntervention.title).toEqual(
        'test scenario intervention',
      );

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(4);
      expect(allSourcingRecords[1]).toEqual(4);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            typeAccordingToIntervention:
              'Sourcing location canceled by intervention',
          },
        });

      expect(canceledSourcingLocations.length).toBe(1);
      expect(canceledSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(canceledSourcingLocations[0].materialId).toEqual(
        preconditions.material1.id,
      );
      expect(canceledSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1.id,
      );

      const canceledSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: canceledSourcingLocations[0].id,
          },
        });

      expect(canceledSourcingRecords.length).toBe(1);
      expect(canceledSourcingRecords[0].tonnage).toEqual('500');

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            typeAccordingToIntervention:
              'New sourcing location of the intervention',
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(newSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1.id,
      );

      const newSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: canceledSourcingLocations[0].id,
          },
        });

      expect(newSourcingRecords.length).toBe(1);
      expect(newSourcingRecords[0].tonnage).toEqual('500');
    });
  });

  describe('Scenario interventions - Creating intervention of type - Change of supplier location', () => {
    test('Create a scenario intervention of type Change of supplier location, with correct data should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditions();

      const geoRegion: GeoRegion = await createGeoRegion();
      await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'scenario intervention supplier',
          startYear: 2018,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialsIds: [preconditions.material1.id],
          suppliersIds: [preconditions.supplier1.id],
          businessUnitsIds: [preconditions.businessUnit1.id],
          adminRegionsIds: [preconditions.adminRegion1.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newCountryInput: 'Spain',
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.CREATED);

      const createdScenarioIntervention =
        await scenarioInterventionRepository.findOne(response.body.data.id);

      if (!createdScenarioIntervention) {
        throw new Error('Error loading created Scenario intervention');
      }

      expect(createdScenarioIntervention.title).toEqual(
        'scenario intervention supplier',
      );

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(4);
      expect(allSourcingRecords[1]).toEqual(4);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            typeAccordingToIntervention:
              'Sourcing location canceled by intervention',
          },
        });

      expect(canceledSourcingLocations.length).toBe(1);
      expect(canceledSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(canceledSourcingLocations[0].materialId).toEqual(
        preconditions.material1.id,
      );
      expect(canceledSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1.id,
      );

      const canceledSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: canceledSourcingLocations[0].id,
          },
        });

      expect(canceledSourcingRecords.length).toBe(1);
      expect(canceledSourcingRecords[0].tonnage).toEqual('500');

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            typeAccordingToIntervention:
              'New sourcing location of the intervention',
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(newSourcingLocations[0].materialId).toEqual(
        preconditions.material1.id,
      );
      expect(newSourcingLocations[0].adminRegionId).not.toEqual(
        preconditions.adminRegion1.id,
      );
      expect(newSourcingLocations[0].geoRegionId).toEqual(geoRegion.id);

      const newSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: canceledSourcingLocations[0].id,
          },
        });

      expect(newSourcingRecords.length).toBe(1);
      expect(newSourcingRecords[0].tonnage).toEqual('500');
    });
  });

  describe('Scenario interventions - Creating intervention of type - Change of material', () => {
    test('Create a scenario intervention of type Change of material, with correct data should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditions();

      const geoRegion: GeoRegion = await createGeoRegion();
      await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });

      const replacingMaterial: Material = await createMaterial();

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'scenario intervention material',
          startYear: 2018,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialsIds: [
            preconditions.material1.id,
            preconditions.material2.id,
          ],
          suppliersIds: [
            preconditions.supplier1.id,
            preconditions.supplier2.id,
          ],
          businessUnitsIds: [
            preconditions.businessUnit1.id,
            preconditions.businessUnit2.id,
          ],
          adminRegionsIds: [
            preconditions.adminRegion1.id,
            preconditions.adminRegion2.id,
          ],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newCountryInput: 'Spain',
          newMaterialId: replacingMaterial.id,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.CREATED);

      const createdScenarioIntervention =
        await scenarioInterventionRepository.findOne(response.body.data.id);

      if (!createdScenarioIntervention) {
        throw new Error('Error loading created Scenario intervention');
      }

      expect(createdScenarioIntervention.title).toEqual(
        'scenario intervention material',
      );

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(5);
      expect(allSourcingRecords[1]).toEqual(5);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            typeAccordingToIntervention:
              'Sourcing location canceled by intervention',
          },
        });

      expect(canceledSourcingLocations.length).toBe(2);

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            typeAccordingToIntervention:
              'New sourcing location of the intervention',
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(newSourcingLocations[0].materialId).toEqual(replacingMaterial.id);
      expect(newSourcingLocations[0].adminRegionId).not.toEqual(
        preconditions.adminRegion1.id,
      );
      expect(newSourcingLocations[0].geoRegionId).toEqual(geoRegion.id);

      const newSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: newSourcingLocations[0].id,
          },
        });

      expect(newSourcingRecords.length).toBe(1);
      expect(newSourcingRecords[0].tonnage).toEqual('1100');
    });
  });

  describe('Scenario interventions - Missing data for requested filters', () => {
    test('Create a scenario intervention of type Change of production efficiency with start year for which there is no sourcing data, should return an error', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditions();

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialsIds: [preconditions.material1.id],
          suppliersIds: [preconditions.supplier1.id],
          businessUnitsIds: [preconditions.businessUnit1.id],
          adminRegionsIds: [preconditions.adminRegion1.id],
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errors[0].title).toEqual(
        'No actual data for requested filters',
      );
    });

    test('Create a scenario intervention of type Change of production efficiency, when there are no sourcing locations matching the filters, should return an error', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditions();

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2015,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialsIds: [preconditions.material1.id],
          suppliersIds: [preconditions.supplier2.id],
          businessUnitsIds: [preconditions.businessUnit2.id],
          adminRegionsIds: [preconditions.adminRegion2.id],
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errors[0].title).toEqual(
        'No actual data for requested filters',
      );
    });
  });

  describe('Missing data and validations', () => {
    test('Create a scenario intervention without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send();

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'title must be shorter than or equal to 40 characters',
          'title must be longer than or equal to 2 characters',
          'title should not be empty',
          'title must be a string',
          'type must be a valid enum value',
          'type should not be empty',
          'type must be a string',
          'startYear should not be empty',
          'startYear must be a number conforming to the specified constraints',
          'percentage should not be empty',
          'percentage must be a number conforming to the specified constraints',
          'scenarioId should not be empty',
          'scenarioId must be a UUID',
          'materialsIds should not be empty',
          'each value in materialsIds must be a UUID',
          'businessUnitsIds should not be empty',
          'each value in businessUnitsIds must be a UUID',
          'suppliersIds should not be empty',
          'each value in suppliersIds must be a UUID',
          'newIndicatorCoefficients should not be empty',
          'newIndicatorCoefficients must be a json string',
        ],
      );
    });

    test('Create new intervention with replacing supplier without new location type should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available columns for new location type: production unit, processing facility, tier 1 Trade facility, tier 2 Trade facility, origin Country, unknown, aggregation point, point of production, country of production',
          'New location type input is required for the selected intervention type',
        ],
      );
    });

    test('Create new intervention with replacing supplier with new location type Country and no country data should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New country input is required for the selected intervention and location type',
        ],
      );

      const response2 = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.ORIGIN_COUNTRY,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response2).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New country input is required for the selected intervention and location type',
        ],
      );
    });

    test('Create new intervention with replacing supplier with new location type point of Production or Aggregation point and no address/coordinates data should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.AGGREGATION_POINT,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New address or coordinates input is required for the selected intervention and location type',
        ],
      );

      const response2 = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response2).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New address or coordinates input is required for the selected intervention and location type',
        ],
      );
    });

    test('Create new intervention with replacing material without new location data fields and new material should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialsIds: [material.id],
          suppliersIds: [supplier.id],
          businessUnitsIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newIndicatorCoefficients:
            '{ "ce": "11", "de": "10", "ww": "5", "bi": "3" }',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available columns for new location type: production unit, processing facility, tier 1 Trade facility, tier 2 Trade facility, origin Country, unknown, aggregation point, point of production, country of production',
          'New location type input is required for the selected intervention type',
          'newMaterialId must be a UUID',
          'New Material is required for the selected intervention type',
        ],
      );
    });
  });

  describe('Scenario interventions - Update', () => {
    test('Update a scenario intervention should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'updated test scenario intervention',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'updated test scenario intervention',
      );

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });

  describe('Scenario interventions - Delete', () => {
    test('Delete a scenario intervention should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      await request(app.getHttpServer())
        .delete(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await scenarioInterventionRepository.findOne(scenarioIntervention.id),
      ).toBeUndefined();
    });
  });

  describe('Scenario interventions - Get all', () => {
    test('Get all scenario interventions should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(scenarioIntervention.id);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Get scenario interventions in pages should return a partial list of scenario interventions', async () => {
      await Promise.all(
        Array.from(Array(10).keys()).map(() => createScenarioIntervention()),
      );

      const responseOne = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          page: {
            size: 3,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(responseOne.body.data).toHaveLength(3);
      expect(responseOne).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);

      const responseTwo = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          page: {
            size: 3,
            number: 4,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(responseTwo.body.data).toHaveLength(1);
      expect(responseTwo).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Get scenario interventions filtered by some criteria should only return the scenario interventions that match said criteria', async () => {
      const scenarioInterventionOne: ScenarioIntervention =
        await createScenarioIntervention({
          title: 'scenario intervention one',
          status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
        });
      const scenarioInterventionTwo: ScenarioIntervention =
        await createScenarioIntervention({
          title: 'scenario intervention two',
          status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
        });
      await createScenarioIntervention({
        title: 'scenario intervention three',
        status: SCENARIO_INTERVENTION_STATUS.DELETED,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          filter: {
            status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
          },
        })
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((e: any) => e.id)).toEqual([
        scenarioInterventionOne.id,
        scenarioInterventionTwo.id,
      ]);
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });

  describe('Scenario interventions - Get by id', () => {
    test('Get a scenario intervention by id should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(scenarioIntervention.id);
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });
  });
});
