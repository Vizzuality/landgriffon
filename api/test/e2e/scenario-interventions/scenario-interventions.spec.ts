import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  SCENARIO_INTERVENTION_STATUS,
  SCENARIO_INTERVENTION_TYPE,
  ScenarioIntervention,
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
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import {
  createInterventionPreconditions,
  createInterventionPreconditionsWithMultipleYearRecords,
  ScenarioInterventionPreconditions,
} from '../../utils/scenario-interventions-preconditions';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';

const expectedJSONAPIAttributes: string[] = [
  'title',
  'description',
  'status',
  'type',
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
  let scenarioRepository: ScenarioRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let adminRegionRepository: AdminRegionRepository;
  let businessUnitRepository: BusinessUnitRepository;
  let supplierRepository: SupplierRepository;
  let materialRepository: MaterialRepository;
  let geoRegionRepository: GeoRegionRepository;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ScenarioInterventionsModule,
        ScenariosModule,
        SourcingLocationsModule,
        SourcingRecordsModule,
        IndicatorRecordsModule,
      ],
    })
      .overrideProvider(GeoCodingAbstractClass)
      .useValue(geoCodingServiceMock)
      .overrideProvider(IndicatorRecordsService)
      .useValue({ createIndicatorRecordsBySourcingRecords: () => null })
      .compile();

    scenarioInterventionRepository =
      moduleFixture.get<ScenarioInterventionRepository>(
        ScenarioInterventionRepository,
      );

    scenarioRepository =
      moduleFixture.get<ScenarioRepository>(ScenarioRepository);
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
    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    app = getApp(moduleFixture);
    await app.init();
    const tokenWithId = await saveUserAndGetTokenWithUserId(moduleFixture, app);
    jwtToken = tokenWithId.jwtToken;
    userId = tokenWithId.userId;
  });

  afterEach(async () => {
    await sourcingLocationRepository.delete({});
    await sourcingRecordRepository.delete({});
    await scenarioInterventionRepository.delete({});
    await scenarioRepository.delete({});
    await adminRegionRepository.delete({});
    await geoRegionRepository.delete({});
    await materialRepository.delete({});
    await businessUnitRepository.delete({});
    await supplierRepository.delete({});
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
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier1.id],
          businessUnitIds: [preconditions.businessUnit1.id],
          adminRegionIds: [preconditions.adminRegion1.id],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
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

      expect(response).toHaveJSONAPIAttributes([
        ...expectedJSONAPIAttributes,
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
      ]);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      const canceledSourcingLocation: SourcingLocation | undefined =
        allSourcingLocations[0].find(
          (sl: SourcingLocation) =>
            sl.interventionType ===
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
        );

      expect(canceledSourcingLocation?.locationCountryInput).toEqual('uvwxy');
      expect(canceledSourcingLocation?.locationAddressInput).toEqual('pqrst');

      const replacingSourcingLocation: SourcingLocation | undefined =
        allSourcingLocations[0].find(
          (sl: SourcingLocation) =>
            sl.interventionType ===
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
        );

      expect(replacingSourcingLocation?.locationCountryInput).toEqual('uvwxy');
      expect(replacingSourcingLocation?.locationAddressInput).toEqual('pqrst');

      expect(allSourcingLocations[1]).toEqual(4);
      expect(allSourcingRecords[1]).toEqual(4);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
          },
        });

      expect(canceledSourcingLocations.length).toBe(1);
      expect(canceledSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(canceledSourcingLocations[0].materialId).toEqual(
        preconditions.material1Descendant.id,
      );
      expect(canceledSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1Descendant.id,
      );

      expect(canceledSourcingLocations[0].businessUnitId).toEqual(
        preconditions.businessUnit1Descendant.id,
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
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(newSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1Descendant.id,
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
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier1.id],
          businessUnitIds: [preconditions.businessUnit1.id],
          adminRegionIds: [preconditions.adminRegion1.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newLocationCountryInput: 'Spain',
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
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

      expect(response).toHaveJSONAPIAttributes([
        ...expectedJSONAPIAttributes,
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
      ]);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(4);
      expect(allSourcingRecords[1]).toEqual(4);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
          },
        });

      expect(canceledSourcingLocations.length).toBe(1);
      expect(canceledSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(canceledSourcingLocations[0].materialId).toEqual(
        preconditions.material1Descendant.id,
      );
      expect(canceledSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1Descendant.id,
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
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(newSourcingLocations[0].materialId).toEqual(
        preconditions.material1Descendant.id,
      );
      expect(newSourcingLocations[0].adminRegionId).not.toEqual(
        preconditions.adminRegion1Descendant.id,
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

    test('Create a scenario intervention of type Change of supplier location with start year for which there are multiple years, should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditionsWithMultipleYearRecords();

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
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier1.id],
          businessUnitIds: [preconditions.businessUnit1.id],
          adminRegionIds: [preconditions.adminRegion1.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newLocationCountryInput: 'Spain',
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
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

      expect(response).toHaveJSONAPIAttributes([
        ...expectedJSONAPIAttributes,
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
      ]);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(4);
      expect(allSourcingRecords[1]).toEqual(8);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
          },
        });

      expect(canceledSourcingLocations.length).toBe(1);
      expect(canceledSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(canceledSourcingLocations[0].materialId).toEqual(
        preconditions.material1Descendant.id,
      );
      expect(canceledSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1Descendant.id,
      );

      const canceledSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: canceledSourcingLocations[0].id,
          },
        });

      expect(canceledSourcingRecords.length).toBe(2);
      expect(canceledSourcingRecords[0].tonnage).toEqual('500');
      expect(canceledSourcingRecords[1].tonnage).toEqual('550');

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        response.body.data.id,
      );
      expect(newSourcingLocations[0].materialId).toEqual(
        preconditions.material1Descendant.id,
      );
      expect(newSourcingLocations[0].adminRegionId).not.toEqual(
        preconditions.adminRegion1Descendant.id,
      );
      expect(newSourcingLocations[0].geoRegionId).toEqual(geoRegion.id);

      const newSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: canceledSourcingLocations[0].id,
          },
        });

      expect(newSourcingRecords.length).toBe(2);
      expect(newSourcingRecords[0].tonnage).toEqual('500');
      expect(newSourcingRecords[0].year).toEqual(2018);
      expect(newSourcingRecords[1].year).toEqual(2019);
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
          materialIds: [preconditions.material1.id, preconditions.material2.id],
          supplierIds: [preconditions.supplier1.id, preconditions.supplier2.id],
          businessUnitIds: [
            preconditions.businessUnit1.id,
            preconditions.businessUnit2.id,
          ],
          adminRegionIds: [
            preconditions.adminRegion1.id,
            preconditions.adminRegion2.id,
          ],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newLocationCountryInput: 'Spain',
          newMaterialId: replacingMaterial.id,
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
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

      expect(response).toHaveJSONAPIAttributes([
        ...expectedJSONAPIAttributes,
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
        'newAdminRegion',
        'newMaterial',
      ]);

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(5);
      expect(allSourcingRecords[1]).toEqual(5);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
          },
        });

      expect(canceledSourcingLocations.length).toBe(2);

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
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
      expect(newSourcingRecords[0].tonnage).toEqual('550');
    });

    test(
      'When I create a new Intervention, But I dont supply any suppliers for filtering' +
        'Then the API should filter all available suppliers matching the rest of the filters' +
        'And the Intervention should be created successfully',
      async () => {
        const preconditions: ScenarioInterventionPreconditions =
          await createInterventionPreconditions();

        const geoRegion: GeoRegion = await createGeoRegion();
        await createAdminRegion({
          isoA2: 'ABC',
          geoRegion,
        });

        const replacingMaterial: Material = await createMaterial();

        await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'scenario intervention material',
            startYear: 2018,
            percentage: 50,
            scenarioId: preconditions.scenario.id,
            materialIds: [
              preconditions.material1.id,
              preconditions.material2.id,
            ],
            businessUnitIds: [
              preconditions.businessUnit1.id,
              preconditions.businessUnit2.id,
            ],
            adminRegionIds: [
              preconditions.adminRegion1.id,
              preconditions.adminRegion2.id,
            ],
            type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
            newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
            newLocationCountryInput: 'Spain',
            newMaterialId: replacingMaterial.id,
            newIndicatorCoefficients: {
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              UWU_T: 5,
              BL_LUC_T: 3,
            },
          });

        expect(HttpStatus.CREATED);
      },
    );
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
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier1.id],
          businessUnitIds: [preconditions.businessUnit1.id],
          adminRegionIds: [preconditions.adminRegion1.id],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
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
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier2.id],
          businessUnitIds: [preconditions.businessUnit2.id],
          adminRegionIds: [preconditions.adminRegion2.id],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
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
          'materialIds should not be empty',
          'each value in materialIds must be a UUID',
          'businessUnitIds should not be empty',
          'each value in businessUnitIds must be a UUID',
          'adminRegionIds should not be empty',
          'each value in adminRegionIds must be a UUID',
          'New Location Country input is required for the selected intervention and location type',
        ],
      );
    });

    test('Create new intervention with replacing supplier without new location type should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const adminRegion: AdminRegion = await createAdminRegion();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          adminRegionIds: [adminRegion.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available columns for new location type: unknown, aggregation point, point of production, country of production',
          'New location type input is required for the selected intervention type',
          'New Location Country input is required for the selected intervention and location type',
        ],
      );
    });

    test('Create new intervention with replacing supplier with new location type Country and no country data should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const adminRegion: AdminRegion = await createAdminRegion();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          adminRegionIds: [adminRegion.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New Location Country input is required for the selected intervention and location type',
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
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          adminRegionIds: [adminRegion.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response2).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New Location Country input is required for the selected intervention and location type',
        ],
      );
    });

    // TODO: Add custom validation to check if either newLocationAddressInput or LAT LONG properties are provided for intervention types needing geocoding.
    //       This can't be done by class-validator
    test.skip('Create new intervention with replacing supplier with new location type point of Production or Aggregation point and no address/coordinates data should fail with a 400 error', async () => {
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
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.AGGREGATION_POINT,
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New Location Country input is required for the selected intervention and location type',
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
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          newLocationCountryInput: 'TestCountry',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response2).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'New address or coordinates input is required for the selected intervention and location type',
          'New Location Country input is required for the selected intervention and location type',
        ],
      );
    });

    test('Create new intervention with replacing material without new location data fields and new material should fail with a 400 error', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const supplier: Supplier = await createSupplier();
      const businessUnit: BusinessUnit = await createBusinessUnit();
      const adminRegion: AdminRegion = await createAdminRegion();
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2025,
          percentage: 50,
          scenarioId: scenario.id,
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          adminRegionIds: [adminRegion.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newLocationCountryInput: 'TestCountry',
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available columns for new location type: unknown, aggregation point, point of production, country of production',
          'newMaterialId must be a UUID',
          'New Material is required for the selected intervention type',
          'New location type input is required for the selected intervention type',
        ],
      );
    });
  });

  describe('Scenario interventions - Update', () => {
    test('Update a scenario intervention basic properties should be successful (happy case)', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'updated test scenario intervention',
        })
        .expect(HttpStatus.OK);

      const updatedScenarioIntervention =
        await scenarioInterventionRepository.findOneOrFail(
          scenarioIntervention.id,
        );
      expect(updatedScenarioIntervention.updatedById).toEqual(userId);

      expect(response.body.data.attributes.title).toEqual(
        'updated test scenario intervention',
      );

      // Note: Update response does not retrieve the related resources
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Update a scenario intervention needing recalculation should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditionsWithMultipleYearRecords();

      const responseOnCreate = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test scenario intervention',
          startYear: 2018,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier1.id],
          businessUnitIds: [preconditions.businessUnit1.id],
          adminRegionIds: [preconditions.adminRegion1.id],
          newLocationCountryInput: 'TestCountry',
          type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          newIndicatorCoefficients: {
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            UWU_T: 5,
            BL_LUC_T: 3,
          },
        });

      expect(HttpStatus.CREATED);
      const scenarioIntervention =
        await scenarioInterventionRepository.findOneOrFail(
          responseOnCreate.body.data.id,
        );
      const sourcingRecordsCountBeforeUpdate: number =
        await sourcingRecordRepository.count();
      expect(sourcingRecordsCountBeforeUpdate).toEqual(8);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${scenarioIntervention.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          startYear: 2019,
        })
        .expect(HttpStatus.OK);

      const updatedScenarioIntervention =
        await scenarioInterventionRepository.findOneOrFail(
          response.body.data.id,
        );
      expect(updatedScenarioIntervention.updatedById).toEqual(userId);

      // Note: Update response does not retrieve the related resources
      expect(response).toHaveJSONAPIAttributes([
        ...expectedJSONAPIAttributes,
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
      ]);
      const sourcingRecordsCountAfterUpdate: number =
        await sourcingRecordRepository.count();
      expect(sourcingRecordsCountAfterUpdate).toEqual(6);
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

  describe('Scenario Interventions - Only replacing / replaced elements as part of a Intervention', () => {
    test(
      'When I create an Intervention, But I receive as filters only Parent Element Ids' +
        'And these Parent Element Ids are not present in Sourcing Locations' +
        'Then the created Interventions should only have as replaced' +
        'Those Elements that are present in Sourcing Locations',
      async () => {
        // ARRANGE

        // Not included in Sourcing Locations
        const parentAdminRegion: AdminRegion = await createAdminRegion({
          name: 'parent admin region',
        });
        // Included in Sourcing Locations
        const childAdminRegion: AdminRegion = await createAdminRegion({
          name: 'child admin region',
          parent: parentAdminRegion,
        });
        // Included in Sourcing Locations
        const grandChildAdminRegion: AdminRegion = await createAdminRegion({
          name: 'grand child admin region',
          parent: childAdminRegion,
        });
        // Not included in Sourcing Locations
        const parentMaterial: Material = await createMaterial({
          name: 'parent material',
        });
        // Included in Sourcing Locations
        const childMaterial: Material = await createMaterial({
          name: 'child material',
          parent: parentMaterial,
        });
        // Included in Sourcing Locations
        const grandChildMaterial: Material = await createMaterial({
          name: 'grand child material',
          parent: childMaterial,
        });
        // Not included in Sourcing Locations
        const parentBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'parent business unit',
        });
        // Included in Sourcing Locations
        const childBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'child business unit',
          parent: parentBusinessUnit,
        });
        // Not included in Sourcing Locations
        const parentSupplier: Supplier = await createSupplier({
          name: 'parent supplier',
        });

        const childSupplier: Supplier = await createSupplier({
          name: 'child supplier',
          parent: parentSupplier,
        });

        const sourcingRecord1: SourcingRecord = await createSourcingRecord({
          year: 2020,
        });
        const sourcingRecord2: SourcingRecord = await createSourcingRecord({
          year: 2020,
        });

        await createSourcingLocation({
          adminRegion: grandChildAdminRegion,
          material: grandChildMaterial,
          businessUnit: childBusinessUnit,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord1],
        });

        await createSourcingLocation({
          adminRegion: childAdminRegion,
          material: childMaterial,
          businessUnit: childBusinessUnit,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord2],
        });
        const scenario: Scenario = await createScenario();

        // ACT
        const response = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'test scenario intervention',
            startYear: 2020,
            percentage: 50,
            scenarioId: scenario.id,
            materialIds: [parentMaterial.id],
            supplierIds: [parentSupplier.id],
            businessUnitIds: [parentBusinessUnit.id],
            adminRegionIds: [parentAdminRegion.id],
            type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
          });

        const intervention: ScenarioIntervention | undefined =
          await scenarioInterventionRepository.findOne(response.body.data.id);

        // ASSERT
        expect(intervention).toBeTruthy();
        expect(intervention?.replacedAdminRegions).toHaveLength(2);
        expect(
          intervention?.replacedAdminRegions
            .map((el: AdminRegion) => el.id)
            .sort(),
        ).toEqual([childAdminRegion.id, grandChildAdminRegion.id].sort());
        expect(
          intervention?.replacedMaterials.map((el: Material) => el.id).sort(),
        ).toEqual([childMaterial.id, grandChildMaterial.id].sort());
        expect(intervention?.replacedBusinessUnits[0].id).toEqual(
          childBusinessUnit.id,
        );
        expect(intervention?.replacedSuppliers[0].id).toEqual(childSupplier.id);
      },
    );

    test(
      'When I create a new Intervention to switch to a new Material' +
        'Then said Intervention should retrieve the new Material and the new Admin Region',
      async () => {
        // ARRANGE

        // Requirements for GeoCoding Mock
        const geoRegion: GeoRegion = await createGeoRegion();
        const newAdminRegion: AdminRegion = await createAdminRegion({
          geoRegion,
          name: 'new admin region',
        });

        // Not included in Sourcing Locations
        const parentAdminRegion: AdminRegion = await createAdminRegion({
          name: 'parent admin region',
        });
        // Included in Sourcing Locations
        const childAdminRegion: AdminRegion = await createAdminRegion({
          name: 'child admin region',
          parent: parentAdminRegion,
        });
        // Included in Sourcing Locations
        const grandChildAdminRegion: AdminRegion = await createAdminRegion({
          name: 'grand child admin region',
          parent: childAdminRegion,
        });
        // Not included in Sourcing Locations
        const parentMaterial: Material = await createMaterial({
          name: 'parent material',
        });
        // Included in Sourcing Locations
        const childMaterial: Material = await createMaterial({
          name: 'child material',
          parent: parentMaterial,
        });

        // New Material that should be included in the intervention
        const newMaterial: Material = await createMaterial({
          name: 'new material',
        });
        // Included in Sourcing Locations
        const grandChildMaterial: Material = await createMaterial({
          name: 'grand child material',
          parent: childMaterial,
        });
        // Not included in Sourcing Locations
        const parentBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'parent business unit',
        });
        // Included in Sourcing Locations
        const childBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'child business unit',
          parent: parentBusinessUnit,
        });
        // Not included in Sourcing Locations
        const parentSupplier: Supplier = await createSupplier({
          name: 'parent supplier',
        });

        const childSupplier: Supplier = await createSupplier({
          name: 'child supplier',
          parent: parentSupplier,
        });

        const sourcingRecord1: SourcingRecord = await createSourcingRecord({
          year: 2020,
        });
        const sourcingRecord2: SourcingRecord = await createSourcingRecord({
          year: 2020,
        });

        await createSourcingLocation({
          adminRegion: grandChildAdminRegion,
          material: grandChildMaterial,
          businessUnit: childBusinessUnit,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord1],
        });

        await createSourcingLocation({
          adminRegion: childAdminRegion,
          material: childMaterial,
          businessUnit: childBusinessUnit,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord2],
        });
        const scenario: Scenario = await createScenario();

        const response = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'scenario intervention material',
            startYear: 2020,
            percentage: 50,
            scenarioId: scenario.id,
            materialIds: [parentMaterial.id],
            supplierIds: [parentSupplier.id],
            businessUnitIds: [parentBusinessUnit.id],
            adminRegionIds: [parentAdminRegion.id],
            type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
            newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
            newLocationCountryInput: 'Spain',
            newMaterialId: newMaterial.id,
          });

        const intervention: ScenarioIntervention | undefined =
          await scenarioInterventionRepository.findOne(response.body.data.id);

        // ASSERT
        expect(intervention).toBeTruthy();
        expect(intervention!.newMaterial.id).toEqual(newMaterial.id);
        expect(intervention!.newAdminRegion.id).toEqual(newAdminRegion.id);
      },
    );
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

  describe('Cascade delete os Scenario', () => {
    test('When Scenario is deleted, related interventions must be deleted as well', async () => {
      const scenarioIntervention: ScenarioIntervention =
        await createScenarioIntervention();

      const sourcingLocation: SourcingLocation = await createSourcingLocation({
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      });

      await createSourcingRecord({ sourcingLocationId: sourcingLocation.id });

      const scenarios: Scenario[] = await scenarioRepository.find();
      const interventions: ScenarioIntervention[] =
        await scenarioInterventionRepository.find();
      const sourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find();
      const sourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find();

      expect(scenarios.length).toBe(1);
      expect(interventions.length).toBe(1);
      expect(sourcingLocations.length).toBe(1);
      expect(sourcingRecords.length).toBe(1);

      await scenarioRepository.delete(scenarioIntervention.scenarioId);

      const interventionsAfterDelete: ScenarioIntervention[] =
        await scenarioInterventionRepository.find();
      const sourcingLocationsAfterDelete: SourcingLocation[] =
        await sourcingLocationRepository.find();
      const sourcingRecordsAfterDelete: SourcingRecord[] =
        await sourcingRecordRepository.find();

      expect(interventionsAfterDelete.length).toBe(0);
      expect(sourcingLocationsAfterDelete.length).toBe(0);
      expect(sourcingRecordsAfterDelete.length).toBe(0);
    });
  });
});
