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
  createH3Data,
  createIndicatorRecordForIntervention,
  createMaterial,
  createMaterialToH3,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import { saveUserWithRoleAndGetTokenWithUserId } from '../../utils/userAuth';
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
  createInterventionPreconditionsForSupplierChange,
  createInterventionPreconditionsWithMultipleYearRecords,
  ScenarioInterventionPreconditions,
} from '../../utils/scenario-interventions-preconditions';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';
import { In } from 'typeorm';
import { range } from 'lodash';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { clearEntityTables } from '../../utils/database-test-helper';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Unit } from 'modules/units/unit.entity';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { dropH3DataMock, h3DataMock } from '../h3-data/mocks/h3-data.mock';
import { h3MaterialExampleDataFixture } from '../h3-data/mocks/h3-fixtures';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import { ROLES } from '../../../src/modules/authorization/roles/roles.enum';

const expectedJSONAPIAttributes: string[] = [
  'title',
  'description',
  'startYear',
  'status',
  'type',
  'createdAt',
  'updatedAt',
  'percentage',
  'newIndicatorCoefficients',
  'newLocationType',
  'newLocationCountryInput',
  'newLocationAddressInput',
  'newLocationLatitudeInput',
  'newLocationLongitudeInput',
];

// TODO: Refactor after new methodology is final

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    switch (key) {
      case 'newMethodology':
        return true;
      default:
        return configGet.call(config, key);
    }
  };
  return config;
});

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
    geoCodeSourcingLocation: async (sourcingData: any): Promise<any> => {
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

      return {
        ...sourcingData,
        adminRegionId: adminRegion.id,
        geoRegionId: geoRegion.id,
      };
    },
  };

  jest.spyOn(IndicatorRecord, 'updateImpactView').mockResolvedValue('' as any);

  let app: INestApplication;
  let scenarioInterventionRepository: ScenarioInterventionRepository;
  let scenarioRepository: ScenarioRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let adminRegionRepository: AdminRegionRepository;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let indicatorRepository: IndicatorRepository;
  let geoRegionRepository: GeoRegionRepository;
  let impactCalculatorService: ImpactCalculator;
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

    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );

    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);
    impactCalculatorService =
      moduleFixture.get<ImpactCalculator>(ImpactCalculator);

    app = getApp(moduleFixture);
    await app.init();
    const tokenWithId = await saveUserWithRoleAndGetTokenWithUserId(
      moduleFixture,
      app,
      ROLES.ADMIN,
    );
    jwtToken = tokenWithId.jwtToken;
    userId = tokenWithId.userId;
  });

  afterEach(async () => {
    await clearEntityTables([
      ScenarioIntervention,
      IndicatorRecord,
      MaterialToH3,
      H3Data,
      Material,
      Indicator,
      Unit,
      BusinessUnit,
      AdminRegion,
      GeoRegion,
      Supplier,
      SourcingRecord,
      SourcingLocation,
      SourcingLocationGroup,
      Scenario,
    ]);
    await dropH3DataMock([
      'fake_material_table2002',
      'fake_replacing_material_table',
      'h3_grid_spam2010v2r0_global_ha',
      'h3_grid_ghg_global',
      'h3_grid_deforestation_global',
      'h3_grid_aqueduct_global',
      'fakeChildMaterialTable',
    ]);
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('Scenario interventions - Creating intervention of type - Change of production efficiency', () => {
    test('Create a scenario intervention of type Change of production efficiency, with correct data should be successful', async () => {
      const preconditions = await createInterventionPreconditions();

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
          // TODO generate from enum
          newIndicatorCoefficients: {
            UWU_T: 5,
            UWUSR_T: 5,
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            LI: 3,
          },
        });

      expect(response.status).toBe(HttpStatus.CREATED);

      const allInterventions: [ScenarioIntervention[], number] =
        await scenarioInterventionRepository.findAndCount();
      expect(allInterventions[1]).toEqual(1);
      expect(typeof allInterventions[0][0].id).toBe('string');

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
        allInterventions[0][0].id,
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
      expect(canceledSourcingRecords[0].tonnage).toEqual('250');

      const canceledIndicatorRecords: IndicatorRecord[] =
        await indicatorRecordRepository.find({
          where: { sourcingRecordId: canceledSourcingRecords[0].id },
        });
      expect(canceledIndicatorRecords.length).toBe(4);

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        allInterventions[0][0].id,
      );
      expect(newSourcingLocations[0].adminRegionId).toEqual(
        preconditions.adminRegion1Descendant.id,
      );

      const newSourcingRecords: SourcingRecord[] =
        await sourcingRecordRepository.find({
          where: {
            sourcingLocationId: newSourcingLocations[0].id,
          },
        });

      expect(newSourcingRecords.length).toBe(1);
      expect(newSourcingRecords[0].tonnage).toEqual('250');

      const newIndicatorRecords: IndicatorRecord[] =
        await indicatorRecordRepository.find({
          where: { sourcingRecordId: newSourcingRecords[0].id },
        });

      expect(newIndicatorRecords.length).toBe(5);
      expect(newIndicatorRecords[0].scaler).toEqual(333);
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
        });

      expect(response.status).toBe(HttpStatus.CREATED);

      const allInterventions: [ScenarioIntervention[], number] =
        await scenarioInterventionRepository.findAndCount();
      expect(allInterventions[1]).toEqual(1);
      expect(typeof allInterventions[0][0].id).toBe('string');

      expect(allInterventions[0][0].title).toEqual(
        'scenario intervention supplier',
      );

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
        allInterventions[0][0].id,
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
      expect(canceledSourcingRecords[0].tonnage).toEqual('250');

      const canceledIndicatorRecords: IndicatorRecord[] =
        await indicatorRecordRepository.find({
          where: { sourcingRecordId: canceledSourcingRecords[0].id },
        });
      expect(canceledIndicatorRecords.length).toBe(4);

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        allInterventions[0][0].id,
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
      expect(newSourcingRecords[0].tonnage).toEqual('250');
    });

    test(
      'When I create a scenario intervention of type Change of supplier with provided coefficients, ' +
        'then correct Indicator records with scaler should be saved',
      async () => {
        jest
          .spyOn(
            impactCalculatorService,
            'getProductionValueForGeoregionAndMaterial',
          )
          .mockResolvedValue(100);

        const preconditions: ScenarioInterventionPreconditions =
          await createInterventionPreconditionsForSupplierChange();

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
            businessUnitIds: [preconditions.businessUnit1.id],
            adminRegionIds: [preconditions.adminRegion1.id],
            type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
            newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
            newLocationCountryInput: 'Spain',
            newIndicatorCoefficients: {
              UWU_T: 5,
              UWUSR_T: 5,
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              LI: 3,
            },
          });

        expect(response.status).toBe(HttpStatus.CREATED);

        const newSourcingLocations: SourcingLocation[] =
          await sourcingLocationRepository.find({
            where: {
              interventionType:
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
            },
          });

        const newSourcingRecords: SourcingRecord[] =
          await sourcingRecordRepository.find({
            where: {
              sourcingLocationId: newSourcingLocations[0].id,
            },
          });
        const newIndicatorRecords: IndicatorRecord[] =
          await indicatorRecordRepository.find({
            where: { sourcingRecordId: newSourcingRecords[0].id },
          });

        expect(newIndicatorRecords.length).toBe(5);
        expect(newIndicatorRecords[0].scaler).toEqual(100);
      },
    );

    test('Create a scenario intervention of type Change of supplier location with start year for which there are multiple years, should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditionsForSupplierChange();

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
          businessUnitIds: [preconditions.businessUnit1.id],
          adminRegionIds: [preconditions.adminRegion1.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
          newLocationCountryInput: 'Spain',
        });

      expect(response.status).toBe(HttpStatus.CREATED);

      const allInterventions: [ScenarioIntervention[], number] =
        await scenarioInterventionRepository.findAndCount();
      expect(allInterventions[1]).toEqual(1);
      expect(typeof allInterventions[0][0].id).toBe('string');

      expect(allInterventions[0][0].title).toEqual(
        'scenario intervention supplier',
      );

      const allSourcingLocations: [SourcingLocation[], number] =
        await sourcingLocationRepository.findAndCount();
      const allSourcingRecords: [SourcingRecord[], number] =
        await sourcingRecordRepository.findAndCount();

      expect(allSourcingLocations[1]).toEqual(6);
      expect(allSourcingRecords[1]).toEqual(12);

      const canceledSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
          },
        });

      expect(canceledSourcingLocations.length).toBe(2);
      expect(canceledSourcingLocations[0].scenarioInterventionId).toEqual(
        allInterventions[0][0].id,
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
            sourcingLocationId: In([
              canceledSourcingLocations[0].id,
              canceledSourcingLocations[1].id,
            ]),
          },
        });

      expect(canceledSourcingRecords.length).toBe(4);

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        allInterventions[0][0].id,
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
      expect(newSourcingRecords[0].tonnage).toEqual('250');
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

      const h3ReplacingMaterial = await h3DataMock({
        h3TableName: 'fakeReplacingMaterialTable',
        h3ColumnName: 'fakeReplacingMaterialColumn',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2002,
      });

      await createMaterialToH3(
        replacingMaterial.id,
        h3ReplacingMaterial.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      await createMaterialToH3(
        replacingMaterial.id,
        h3ReplacingMaterial.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenario-interventions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'scenario intervention material',
          startYear: 2018,
          percentage: 50,
          scenarioId: preconditions.scenario.id,
          materialIds: [preconditions.material1.id],
          supplierIds: [preconditions.supplier1.id],
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
        });

      expect(response.status).toBe(HttpStatus.CREATED);

      const allInterventions: [ScenarioIntervention[], number] =
        await scenarioInterventionRepository.findAndCount();
      expect(allInterventions[1]).toEqual(1);
      expect(typeof allInterventions[0][0].id).toBe('string');

      expect(allInterventions[0][0].title).toEqual(
        'scenario intervention material',
      );

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

      const newSourcingLocations: SourcingLocation[] =
        await sourcingLocationRepository.find({
          where: {
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        });

      expect(newSourcingLocations.length).toBe(1);
      expect(newSourcingLocations[0].scenarioInterventionId).toEqual(
        allInterventions[0][0].id,
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
      expect(newSourcingRecords[0].tonnage).toEqual('250');
    });

    test(
      'When I create a new Intervention, But I dont supply any suppliers, business units and admin regions for filtering' +
        'Then the API should filter all available suppliers, business units and admin regions matching the material filter' +
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
        const h3ReplacingMaterial = await h3DataMock({
          h3TableName: 'fakeReplacingMaterialTable',
          h3ColumnName: 'fakeReplacingMaterialColumn',
          additionalH3Data: h3MaterialExampleDataFixture,
          year: 2002,
        });

        await createMaterialToH3(
          replacingMaterial.id,
          h3ReplacingMaterial.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

        await createMaterialToH3(
          replacingMaterial.id,
          h3ReplacingMaterial.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );

        const response = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'scenario intervention material',
            startYear: 2018,
            percentage: 50,
            scenarioId: preconditions.scenario.id,
            materialIds: [preconditions.material1.id],
            type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
            newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
            newLocationCountryInput: 'Spain',
            newMaterialId: replacingMaterial.id,
          });

        expect(response.status).toBe(HttpStatus.CREATED);

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

        const newSourcingLocations: SourcingLocation[] =
          await sourcingLocationRepository.find({
            where: {
              interventionType:
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
            },
          });

        expect(newSourcingLocations.length).toBe(1);
      },
    );

    test(
      'When I create a new Intervention, But the replaced material has descendant materials ' +
        'Then the API should add material descendants to filters ' +
        'And the Intervention should be created successfully',
      async () => {
        const preconditions: ScenarioInterventionPreconditions =
          await createInterventionPreconditions();

        const geoRegion: GeoRegion = await createGeoRegion();
        await createAdminRegion({
          isoA2: 'ABC',
          geoRegion,
        });

        const material1Descendant2 = await createMaterial({
          name: 'Descendant Material',
          parent: preconditions.material1,
        });

        const newDescendantLocation = await createSourcingLocation({
          materialId: material1Descendant2.id,
          t1SupplierId: preconditions.supplier1Descendant.id,
          businessUnitId: preconditions.businessUnit1Descendant.id,
          adminRegionId: preconditions.adminRegion1Descendant.id,
        });

        await createSourcingRecord({
          sourcingLocationId: newDescendantLocation.id,
          year: 2018,
          tonnage: 600,
        });

        const replacingMaterial: Material = await createMaterial();
        const h3ReplacingMaterial = await h3DataMock({
          h3TableName: 'fakeReplacingMaterialTable',
          h3ColumnName: 'fakeReplacingMaterialColumn',
          additionalH3Data: h3MaterialExampleDataFixture,
          year: 2002,
        });

        await createMaterialToH3(
          replacingMaterial.id,
          h3ReplacingMaterial.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

        await createMaterialToH3(
          replacingMaterial.id,
          h3ReplacingMaterial.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );

        const response = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'scenario intervention material',
            startYear: 2018,
            percentage: 50,
            scenarioId: preconditions.scenario.id,
            materialIds: [preconditions.material1.id],
            type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
            newLocationType: LOCATION_TYPES.COUNTRY_OF_PRODUCTION,
            newLocationCountryInput: 'Spain',
            newMaterialId: replacingMaterial.id,
          });

        expect(response.status).toBe(HttpStatus.CREATED);

        const allSourcingLocations: [SourcingLocation[], number] =
          await sourcingLocationRepository.findAndCount();
        const allSourcingRecords: [SourcingRecord[], number] =
          await sourcingRecordRepository.findAndCount();

        expect(allSourcingLocations[1]).toEqual(6);
        expect(allSourcingRecords[1]).toEqual(6);

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
              interventionType:
                SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
            },
          });

        expect(newSourcingLocations.length).toBe(1);
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
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
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

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
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
          'Intervention must cover 1 existing material',
          'New Location Country input is required for the selected intervention and location type',
          'each value in materialIds must be a UUID',
          'materialIds should not be empty',
          'percentage must be a number conforming to the specified constraints',
          'percentage should not be empty',
          'scenarioId must be a UUID',
          'scenarioId should not be empty',
          'startYear must be a number conforming to the specified constraints',
          'startYear should not be empty',
          'type must be a string',
          'type must be a valid enum value',
          'type should not be empty',
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
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Available location types options: unknown,production-aggregation-point,point-of-production,country-of-production,administrative-region-of-production,country-of-delivery',
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

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
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
          materialIds: [material.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          newLocationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        });

      expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          `New Location Country input is required for the selected intervention and location type`,
          `Address input or coordinates are required for locations of type ${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}.`,
          `Address input or coordinates are required for locations of type ${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}. Latitude values must be min: -90, max: 90`,
          `Address input or coordinates are required for locations of type ${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}. Longitude values must be min: -180, max: 180`,
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

      expect(response2.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response2).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          `Address input or coordinates are required for locations of type ${LOCATION_TYPES.POINT_OF_PRODUCTION}.`,
          `Address input or coordinates are required for locations of type ${LOCATION_TYPES.POINT_OF_PRODUCTION}. Latitude values must be min: -90, max: 90`,
          `Address input or coordinates are required for locations of type ${LOCATION_TYPES.POINT_OF_PRODUCTION}. Longitude values must be min: -180, max: 180`,
        ],
      );

      const response3 = await request(app.getHttpServer())
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
          newLocationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          newLocationCountryInput: 'TestCountry',
          newLocationLatitude: -4,
          newLocationLongitude: -60,
          newLocationAddressInput: 'address',
        });

      expect(response3.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response3).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          `Address input OR coordinates are required for locations of type ${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}. Address must be empty if coordinates are provided`,
          `Address input OR coordinates must be provided for locations of type ${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}. Latitude must be empty if address is provided`,
          `Address input OR coordinates must be provided for locations of type ${LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT}. Longitude must be empty if address is provided`,
        ],
      );
    });

    test('When I Create new intervention with replacing material without new location data fields and new material Then I should get a 400 error', async () => {
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

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          `Available location types options: ${Object.values(
            LOCATION_TYPES,
          ).join(',')}`,
          'newMaterialId must be a UUID',
          'New Material is required for the selected intervention type',
          'New location type input is required for the selected intervention type',
        ],
      );
    });

    test('When I Create new intervention for more than 1 material Then I should get a relevant error message', async () => {
      const scenario: Scenario = await createScenario();
      const material: Material = await createMaterial();
      const material2: Material = await createMaterial();
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
          materialIds: [material.id, material2.id],
          supplierIds: [supplier.id],
          businessUnitIds: [businessUnit.id],
          adminRegionIds: [adminRegion.id],
          type: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          newLocationCountryInput: 'TestCountry',
          newLocationType: 'unknown',
          newMaterialId: material.id,
        });

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        ['Intervention must cover 1 existing material'],
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
          status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
        });

      expect(response.status).toBe(HttpStatus.OK);
      const updatedScenarioIntervention =
        await scenarioInterventionRepository.findOneOrFail(
          scenarioIntervention.id,
        );
      expect(updatedScenarioIntervention.updatedById).toEqual(userId);

      expect(response.body.data.attributes.title).toEqual(
        'updated test scenario intervention',
      );
      expect(response.body.data.attributes.status).toEqual(
        SCENARIO_INTERVENTION_STATUS.INACTIVE,
      );

      // Note: Update response does not retrieve the related resources
      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    // TODO: Skipping this tests since the FE will send a new full DTO when editing a intervention
    test.skip('Update a scenario intervention needing recalculation should be successful', async () => {
      const preconditions: ScenarioInterventionPreconditions =
        await createInterventionPreconditionsWithMultipleYearRecords();

      await request(app.getHttpServer())
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
            UWU_T: 5,
            UWUSR_T: 5,
            GHG_LUC_T: 1,
            DF_LUC_T: 10,
            LI: 3,
          },
        });

      expect(HttpStatus.CREATED);

      const allInterventions: [ScenarioIntervention[], number] =
        await scenarioInterventionRepository.findAndCount();
      expect(allInterventions[1]).toEqual(1);

      const sourcingRecordsCountBeforeUpdate: number =
        await sourcingRecordRepository.count();
      expect(sourcingRecordsCountBeforeUpdate).toEqual(8);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/scenario-interventions/${allInterventions[0][0].id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          startYear: 2019,
        })
        .expect(HttpStatus.OK);

      const allInterventionsAfterUpdate: [ScenarioIntervention[], number] =
        await scenarioInterventionRepository.findAndCount();
      expect(allInterventionsAfterUpdate[1]).toEqual(1);

      const updatedScenarioIntervention =
        await scenarioInterventionRepository.findOneOrFail(
          response.body.data.id,
        );
      expect(updatedScenarioIntervention.updatedById).toEqual(userId);

      // Note: Update response does not retrieve the related resources

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
    let preconditions: ScenarioInterventionPreconditions;

    beforeAll(async () => {
      jest
        .spyOn(indicatorRecordRepository, 'getH3SumOverGeoRegionSQL')
        .mockResolvedValue(1000);
      jest
        .spyOn(indicatorRecordRepository, 'getIndicatorRecordRawValue')
        .mockResolvedValue(1000);
    });

    beforeEach(async () => {
      preconditions = await createInterventionPreconditions();
    });
    afterAll(() => jest.clearAllMocks());

    test(
      'When I create an Intervention, But I receive as filters only Parent Element Ids' +
        'Then the created Interventions should only have as replaced' +
        'Those Elements that has been received as filters' +
        'Regardless being present in Sourcing Locations or not',
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
        // childMaterial Indicator calculation dependencies
        const h3DataChild = await createH3Data();
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );
        // Included in Sourcing Locations
        const grandChildMaterial: Material = await createMaterial({
          name: 'grand child material',
          parent: childMaterial,
        });

        // childMaterial Indicator calculation dependencies
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

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

        await createIndicatorRecordForIntervention(
          {
            indicator: preconditions.indicator1,
            value: 1200,
            scaler: 22,
          },
          sourcingRecord1,
        );

        await createIndicatorRecordForIntervention(
          {
            indicator: preconditions.indicator1,
            value: 1200,
            scaler: 22,
          },
          sourcingRecord2,
        );

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
            newIndicatorCoefficients: {
              UWU_T: 5,
              UWUSR_T: 5,
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              LI: 3,
            },
          });

        const intervention: ScenarioIntervention | undefined =
          await scenarioInterventionRepository.findOne(response.body.data.id);

        // ASSERT
        expect(intervention).toBeTruthy();
        expect(intervention?.replacedAdminRegions).toHaveLength(1);
        expect(intervention?.replacedAdminRegions[0].id).toEqual(
          parentAdminRegion.id,
        );
        expect(intervention?.replacedMaterials[0].id).toEqual(
          parentMaterial.id,
        );
        expect(intervention?.replacedBusinessUnits[0].id).toEqual(
          parentBusinessUnit.id,
        );
        expect(intervention?.replacedSuppliers[0].id).toEqual(
          parentSupplier.id,
        );
      },
    );

    test(
      'When I create a new Intervention' +
        'And I dont select any Element to filter (AR, BR, SUP...)' +
        'Then I should not see any element as replaced by the interventions',
      async () => {
        await indicatorRepository.findAndCount();
        for (const num of range(1, 20)) {
          const adminRegion: AdminRegion = await createAdminRegion({
            name: `admin region:${num}`,
          });
          if (num % 2 === 0) {
            await createSourcingLocation({ adminRegion });
          }
        }
        const parentMaterial: Material = await createMaterial({
          name: 'parent material',
        });

        // Included in Sourcing Locations
        const childMaterial: Material = await createMaterial({
          name: 'child material',
          parent: parentMaterial,
        });
        // childMaterial Indicator calculation dependencies
        const h3DataChild = await createH3Data();
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );
        // Included in Sourcing Locations
        const grandChildMaterial: Material = await createMaterial({
          name: 'grand child material',
          parent: childMaterial,
        });

        // childMaterial Indicator calculation dependencies
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );
        // Not included in Sourcing Locations
        const parentBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'parent business unit',
        });
        // Included in Sourcing Locations
        const childBusinessUnit: BusinessUnit = await createBusinessUnit({
          name: 'child business unit 1',
          parent: parentBusinessUnit,
        });
        // Included in Sourcing Locations
        const childBusinessUnit2: BusinessUnit = await createBusinessUnit({
          name: 'child business unit 2',
          parent: parentBusinessUnit,
        });
        // Not included in Sourcing Locations
        const parentSupplier: Supplier = await createSupplier({
          name: 'parent supplier',
        });

        const parentSupplier2: Supplier = await createSupplier({
          name: 'parent supplier2',
        });
        //Included in Sourcing Locations
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

        const sourcingRecord3: SourcingRecord = await createSourcingRecord({
          year: 2020,
        });

        await createIndicatorRecordForIntervention(
          {
            indicator: preconditions.indicator1,
            value: 1200,
            scaler: 22,
          },
          sourcingRecord1,
        );

        await createIndicatorRecordForIntervention(
          {
            indicator: preconditions.indicator1,
            value: 1200,
            scaler: 22,
          },
          sourcingRecord2,
        );

        await createIndicatorRecordForIntervention(
          {
            indicator: preconditions.indicator1,
            value: 1200,
            scaler: 22,
          },
          sourcingRecord3,
        );

        await createSourcingLocation({
          material: grandChildMaterial,
          businessUnit: childBusinessUnit,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord1],
        });

        await createSourcingLocation({
          material: childMaterial,
          businessUnit: childBusinessUnit2,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord2],
        });

        await createSourcingLocation({
          material: childMaterial,
          businessUnit: childBusinessUnit2,
          producer: parentSupplier2,
          sourcingRecords: [sourcingRecord3],
        });

        const scenario: Scenario = await createScenario();

        const responseAdminRegions = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'test scenario intervention',
            startYear: 2020,
            percentage: 50,
            scenarioId: scenario.id,
            materialIds: [parentMaterial.id],
            supplierIds: [parentSupplier.id, parentSupplier2.id],
            businessUnitIds: [parentBusinessUnit.id],
            type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
            newIndicatorCoefficients: {
              UWU_T: 5,
              UWUSR_T: 5,
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              LI: 3,
            },
          });

        const createdScenarioIntervention1 =
          await scenarioInterventionRepository.findOneOrFail(
            responseAdminRegions.body.data.id,
          );

        expect(createdScenarioIntervention1.replacedAdminRegions).toHaveLength(
          0,
        );
        expect(createdScenarioIntervention1.replacedMaterials[0].id).toEqual(
          parentMaterial.id,
        );
        expect(
          createdScenarioIntervention1.replacedSuppliers
            .map((sup: Supplier) => sup.id)
            .sort(),
        ).toEqual([parentSupplier.id, parentSupplier2.id].sort());

        expect(
          createdScenarioIntervention1.replacedBusinessUnits[0].id,
        ).toEqual(parentBusinessUnit.id);

        const responseBusinessUnits = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'test scenario intervention',
            startYear: 2020,
            percentage: 50,
            scenarioId: scenario.id,
            materialIds: [parentMaterial.id],
            supplierIds: [parentSupplier.id],
            type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
            newIndicatorCoefficients: {
              UWU_T: 5,
              UWUSR_T: 5,
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              LI: 3,
            },
          });

        const createdScenarioIntervention2 =
          await scenarioInterventionRepository.findOneOrFail(
            responseBusinessUnits.body.data.id,
          );

        expect(createdScenarioIntervention2.replacedBusinessUnits).toHaveLength(
          0,
        );

        const responseSuppliers = await request(app.getHttpServer())
          .post('/api/v1/scenario-interventions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            title: 'test scenario intervention',
            startYear: 2020,
            percentage: 50,
            scenarioId: scenario.id,
            materialIds: [parentMaterial.id],
            type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
            newIndicatorCoefficients: {
              UWU_T: 5,
              UWUSR_T: 5,
              GHG_LUC_T: 1,
              DF_LUC_T: 10,
              LI: 3,
            },
          });

        const createdScenarioIntervention3 =
          await scenarioInterventionRepository.findOneOrFail(
            responseSuppliers.body.data.id,
          );
        expect(createdScenarioIntervention3.replacedSuppliers).toHaveLength(0);
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
        // childMaterial Indicator calculation dependencies

        const h3DataChild = await h3DataMock({
          h3TableName: 'fakeChildMaterialTable',
          h3ColumnName: 'fakeChildMaterialColumn',
          additionalH3Data: h3MaterialExampleDataFixture,
          year: 2002,
        });

        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );
        // Included in Sourcing Locations
        const grandChildMaterial: Material = await createMaterial({
          name: 'grand child material',
          parent: childMaterial,
        });

        // childMaterial Indicator calculation dependencies
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

        // New Material that should be included in the intervention
        const newMaterial: Material = await createMaterial({
          name: 'new material',
        });

        await createMaterialToH3(
          newMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          newMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

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

        //ASSERT;
        expect(intervention).toBeTruthy();
        expect(intervention!.newMaterial.id).toEqual(newMaterial.id);
        expect(intervention!.newAdminRegion.id).toEqual(newAdminRegion.id);
      },
    );

    test(
      'When I create a new Intervention to switch to a new Material Or new Supplier' +
        'Then the Locations Canceled by said intervention should have the same locationType as the new location of the intervention',
      async () => {
        // ARRANGE

        // Requirements for GeoCoding Mock
        const geoRegion: GeoRegion = await createGeoRegion();
        await createAdminRegion({
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
        // childMaterial Indicator calculation dependencies
        const h3DataChild = await h3DataMock({
          h3TableName: 'fakeChildMaterialTable',
          h3ColumnName: 'fakeChildMaterialColumn',
          additionalH3Data: h3MaterialExampleDataFixture,
          year: 2002,
        });
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          childMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );
        // Included in Sourcing Locations
        const grandChildMaterial: Material = await createMaterial({
          name: 'grand child material',
          parent: childMaterial,
        });

        // childMaterial Indicator calculation dependencies
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          grandChildMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

        // New Material that should be included in the intervention
        const newMaterial: Material = await createMaterial({
          name: 'new material',
        });

        await createMaterialToH3(
          newMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        await createMaterialToH3(
          newMaterial.id,
          h3DataChild.id,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );
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
          locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        });

        await createSourcingLocation({
          adminRegion: childAdminRegion,
          material: childMaterial,
          businessUnit: childBusinessUnit,
          t1Supplier: childSupplier,
          sourcingRecords: [sourcingRecord2],
          locationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
        });
        const scenario: Scenario = await createScenario();

        await request(app.getHttpServer())
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

        const canceledSourcingLocations = await sourcingLocationRepository.find(
          {
            where: {
              interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
            },
          },
        );

        expect(canceledSourcingLocations).toHaveLength(2);
        expect(
          canceledSourcingLocations.find(
            (location: SourcingLocation) =>
              location.locationType ===
              LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
          ),
        ).toBeTruthy();
        expect(
          canceledSourcingLocations.find(
            (location: SourcingLocation) =>
              location.locationType === LOCATION_TYPES.POINT_OF_PRODUCTION,
          ),
        ).toBeTruthy();
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
  test(
    'When I create a new Intervention using coordinates as new location info, ' +
      'And I GET the new Intervention once its created' +
      'Then the created information should have this information',
    async () => {
      jest
        .spyOn(indicatorRecordRepository, 'getH3SumOverGeoRegionSQL')
        .mockResolvedValue(1000);
      jest
        .spyOn(indicatorRecordRepository, 'getIndicatorRecordRawValue')
        .mockResolvedValue(1000);
      const preconditions = await createInterventionPreconditions();
      const geoRegion: GeoRegion = await createGeoRegion();
      await createAdminRegion({
        isoA2: 'ABC',
        geoRegion,
      });

      //CREATE
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
          newLocationType: LOCATION_TYPES.POINT_OF_PRODUCTION,
          newLocationCountryInput: 'Spain',
          newLocationLatitude: -4,
          newLocationLongitude: -60,
        });

      // GET
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/scenario-interventions/${response.body.data.id}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response2.body.data.attributes.newLocationLatitudeInput).toEqual(
        '-4',
      );
      expect(response2.body.data.attributes.newLocationLongitudeInput).toEqual(
        '-60',
      );
    },
  );
});
