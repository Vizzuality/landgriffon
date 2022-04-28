import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../entity-mocks';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { ImpactModule } from 'modules/impact/impact.module';
import { Unit } from 'modules/units/unit.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material } from 'modules/materials/material.entity';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
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
import { scenarioInterventionComparisonTable } from './response-mocks.impact';

import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

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

  test('When I query the API for a Impact Table, then I should see all the data grouped by the requested entity', async () => {
    // Basic pre-conditions

    const adminRegion: AdminRegion = await createAdminRegion({
      name: 'India',
    });
    const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
    const indicator: Indicator = await createIndicator({
      name: 'Deforestation',
      unit,
    });

    const textile: Material = await createMaterial({ name: 'Textile' });

    const wool: Material = await createMaterial({
      name: 'Wool',
      parent: textile,
    });
    const cotton: Material = await createMaterial({
      name: 'Cotton',
      parent: textile,
    });

    const businessUnit: BusinessUnit = await createBusinessUnit({
      name: 'Fake Business Unit',
    });

    const supplier: Supplier = await createSupplier({ name: 'Fake Supplier' });

    // Scenario pre-conditions

    const scenarioIntervention: ScenarioIntervention =
      await createScenarioIntervention();
    // Sourcing Locations - real ones

    const cottonSourcingLocation: SourcingLocation =
      await createSourcingLocation({
        material: cotton,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      });

    const woolSourcingLocation: SourcingLocation = await createSourcingLocation(
      {
        material: wool,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
      },
    );

    // Sourcing Locations belonging to Intervention - Cotton

    const cottonSourcingLocationCancelled: SourcingLocation =
      await createSourcingLocation({
        material: cotton,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      });

    const cottonSourcingLocationReplacing: SourcingLocation =
      await createSourcingLocation({
        material: cotton,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      });

    // Sourcing Locations belonging to Intervention - Wool

    const woolSourcingLocationCancelled: SourcingLocation =
      await createSourcingLocation({
        material: wool,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      });

    const woolSourcingLocationReplacing: SourcingLocation =
      await createSourcingLocation({
        material: wool,
        businessUnit,
        t1Supplier: supplier,
        adminRegion,
        scenarioInterventionId: scenarioIntervention.id,
        interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      });

    // Creating Sourcing Records and Indicator Records for the Sourcing Locations

    const indicatorRecordCottonReplacing: IndicatorRecord =
      await createIndicatorRecord({
        indicator,
        value: 1000,
      });
    const indicatorRecord1WoolReplacing: IndicatorRecord =
      await createIndicatorRecord({
        indicator,
        value: 1000,
      });

    const indicatorRecordCotton: IndicatorRecord = await createIndicatorRecord({
      indicator,
      value: 1200,
    });

    const indicatorRecordWool: IndicatorRecord = await createIndicatorRecord({
      indicator,
      value: 1200,
    });

    const indicatorRecordCottonCancelled: IndicatorRecord =
      await createIndicatorRecord({
        indicator,
        value: 1200,
      });

    const indicatorRecordWoolCancelled: IndicatorRecord =
      await createIndicatorRecord({
        indicator,
        value: 1200,
      });

    // Sourcing Records + Indicator Records for Real Sourcing Locations

    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecordCotton],
      sourcingLocation: cottonSourcingLocation,
    });

    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecordWool],
      sourcingLocation: woolSourcingLocation,
    });

    // Sourcing Records + Indicator Records for Canceled Sourcing Locations

    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecordCottonCancelled],
      sourcingLocation: cottonSourcingLocationCancelled,
    });

    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecordWoolCancelled],
      sourcingLocation: woolSourcingLocationCancelled,
    });

    // Sourcing Records + Indicator Records for Replacing Sourcing Locations

    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecordCottonReplacing],
      sourcingLocation: cottonSourcingLocationReplacing,
    });

    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecord1WoolReplacing],
      sourcingLocation: woolSourcingLocationReplacing,
    });

    const response1 = await request(app.getHttpServer())
      .get('/api/v1/impact/table')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        'indicatorIds[]': [indicator.id],
        endYear: 2023,
        startYear: 2020,
        groupBy: 'material',
        scenarioId: scenarioIntervention.scenarioId,
      })
      .expect(HttpStatus.OK);

    expect(response1.body.data.impactTable[0].rows).toEqual(
      scenarioInterventionComparisonTable.impactTable[0].rows,
    );
  });
});
