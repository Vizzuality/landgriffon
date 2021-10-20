import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import {
  dropFakeH3Data,
  createWorldForRiskMapGeneration,
} from './mocks/create-fake-h3-data';
import { createMaterial } from '../entity-mocks';
import { MaterialRepository } from '../../src/modules/materials/material.repository';
import {
  Indicator,
  INDICATOR_TYPES,
} from '../../src/modules/indicators/indicator.entity';
import { IndicatorRepository } from '../../src/modules/indicators/indicator.repository';
import { UnitRepository } from '../../src/modules/units/unit.repository';
import { UnitConversionRepository } from '../../src/modules/unit-conversions/unit-conversion.repository';

/**
 * Tests for the H3DataModule.
 */

describe('H3 Data Module (e2e) - Risk map', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  let indicatorRepository: IndicatorRepository;
  let unitRepository: UnitRepository;
  let unitConversionRepository: UnitConversionRepository;
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialRepository = moduleFixture.get<MaterialRepository>(
      MaterialRepository,
    );
    indicatorRepository = moduleFixture.get<IndicatorRepository>(
      IndicatorRepository,
    );
    unitRepository = moduleFixture.get<UnitRepository>(UnitRepository);
    unitConversionRepository = moduleFixture.get<UnitConversionRepository>(
      UnitConversionRepository,
    );

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await dropFakeH3Data([fakeTable]);
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await indicatorRepository.delete({});
    await unitConversionRepository.delete({});
    await unitRepository.delete({});
  });

  afterAll(async () => {
    return app.close();
  });

  test('When I get a calculated H3 Risk Map without an indicator id, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/risk-map`,
    );
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'indicatorId should not be empty',
    );
  });

  test('When I get a calculated H3 Risk Map without a year value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/risk-map`)
      .query({
        indicatorId: indicator.id,
      });
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'year should not be empty',
    );
  });

  test('When I get a calculated H3 Risk Map without a material id value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/risk-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
      });
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'materialId must be a UUID',
    );
  });

  test('When I get a calculated H3 Risk Map without a resolution value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const material = await createMaterial({ name: 'Material with no H3' });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/risk-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
      });
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'Available resolutions: 1 to 6',
    );
  });

  test('When I get a calculated H3 Water Risk Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable,
      fakeColumn,
    });
    jest.spyOn(h3DataRepository, 'getWaterRiskMapByResolution');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/risk-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(h3DataRepository.getWaterRiskMapByResolution).toHaveBeenCalled();
    expect(response.body.data).toEqual([
      {
        h: '861203a4fffffff',
        v: 276.78556227607197,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [1000, 1000, 1000, 1000, 1000, 1000, 1000],
      unit: 'tonnes',
    });
  });
  test('When I get a calculated H3 Biodiversity Loss Risk Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
      fakeTable,
      fakeColumn,
    });
    jest.spyOn(h3DataRepository, 'getBiodiversityLossRiskMapByResolution');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/risk-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(
      h3DataRepository.getBiodiversityLossRiskMapByResolution,
    ).toHaveBeenCalled();
    expect(response.body.data).toEqual([
      {
        h: '861203a4fffffff',
        v: 1000000,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [1000, 1000, 1000, 1000, 1000, 1000, 1000],
      unit: 'tonnes',
    });
  });
});
