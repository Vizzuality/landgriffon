import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';

import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { ImpactModule } from 'modules/impact/impact.module';
import { Indicator } from 'modules/indicators/indicator.entity';

import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { MaterialRepository } from 'modules/materials/material.repository';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { UnitRepository } from 'modules/units/unit.repository';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { createNewMaterialInterventionPreconditions } from './scenario-impact-preconditions/new-material-intervention.preconditions';
import { createNewCoefficientsInterventionPreconditions } from './scenario-impact-preconditions/new-coefficients-intervention.preconditions';
import { newCoefficientsScenarioInterventionTable } from './scenario-impact-responses/new-coefficients-intervention.response';
import { newMaterialScenarioInterventionTable } from './scenario-impact-responses/new-materials-intervention.response';
import { createNewSupplierInterventionPreconditions } from './scenario-impact-preconditions/new-supplier-intervention.preconditions';
import { newSupplierScenarioInterventionTable } from './scenario-impact-responses/new-supplier-intervention.response';
import { createMultipleInterventionsPreconditions } from './scenario-impact-preconditions/mixed-interventions-scenario.preconditions';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { mixedInterventionsScenarioTable } from './scenario-impact-responses/mixed-interventions-scenario.response';

describe('Impact Table and Charts test suite (e2e)', () => {
  let app: INestApplication;
  let indicatorRecordRepository: IndicatorRecordRepository;
  let businessUnitRepository: BusinessUnitRepository;
  let materialRepository: MaterialRepository;
  let supplierRepository: SupplierRepository;
  let adminRegionRepository: AdminRegionRepository;
  let geoRegionRepository: GeoRegionRepository;
  let sourcingLocationRepository: SourcingLocationRepository;
  let sourcingRecordRepository: SourcingRecordRepository;
  let indicatorRepository: IndicatorRepository;
  let sourcingLocationGroupRepository: SourcingLocationGroupRepository;
  let unitRepositoruy: UnitRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImpactModule],
    }).compile();

    unitRepositoruy = moduleFixture.get<UnitRepository>(UnitRepository);

    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );
    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    supplierRepository =
      moduleFixture.get<SupplierRepository>(SupplierRepository);
    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
    );
    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
    sourcingLocationGroupRepository =
      moduleFixture.get<SourcingLocationGroupRepository>(
        SourcingLocationGroupRepository,
      );
    geoRegionRepository =
      moduleFixture.get<GeoRegionRepository>(GeoRegionRepository);
    indicatorRecordRepository = moduleFixture.get<IndicatorRecordRepository>(
      IndicatorRecordRepository,
    );
    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await materialRepository.delete({});
    await indicatorRepository.delete({});
    await unitRepositoruy.delete({});
    await businessUnitRepository.delete({});
    await adminRegionRepository.delete({});
    await geoRegionRepository.delete({});
    await supplierRepository.delete({});
    await indicatorRecordRepository.delete({});
    await sourcingRecordRepository.delete({});
    await sourcingLocationRepository.delete({});
    await sourcingLocationGroupRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Coefficients I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: ScenarioIntervention;
    } = await createNewCoefficientsInterventionPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newCoefficientsScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Material I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: ScenarioIntervention;
    } = await createNewMaterialInterventionPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newMaterialScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test('When I request data for Impact table for a Scenario with Intervention of type New Supplier I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      scenarioIntervention: ScenarioIntervention;
    } = await createNewSupplierInterventionPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'supplier',
        scenarioId: preconditions.scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      newSupplierScenarioInterventionTable.impactTable[0].rows,
    );
  });

  test('When I request data for Impact table for a Scenario with various Interventions of different types I should get the expected results', async () => {
    const preconditions: {
      indicator: Indicator;
      newScenario: Scenario;
    } = await createMultipleInterventionsPreconditions();

    const response = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [preconditions.indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: preconditions.newScenario.id,
      })
      .expect(HttpStatus.OK);

    expect(response.body.data.impactTable[0].rows).toEqual(
      mixedInterventionsScenarioTable.impactTable[0].rows,
    );
  });
});
