import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import { dropH3DataMock, h3DataMock } from './mocks/h3-data.mock';
import { createIndicator, createMaterial } from '../entity-mocks';
import { MaterialRepository } from '../../src/modules/materials/material.repository';
import {
  Indicator,
  INDICATOR_TYPES,
} from '../../src/modules/indicators/indicator.entity';
import { IndicatorRepository } from '../../src/modules/indicators/indicator.repository';
import { UnitRepository } from '../../src/modules/units/unit.repository';
import { UnitConversionRepository } from '../../src/modules/unit-conversions/unit-conversion.repository';
import { createWorldForRiskMapGeneration } from './mocks/h3-risk-map.mock';

/**
 * Tests for the H3DataModule.
 */

/**
 * @debt: Add more elaborated fixtures and more accurate assertions with Data to check that the calculus of all risk-maps are correct (Smoke Tests)
 */

describe('H3 Data Module (e2e) - Risk map', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  let indicatorRepository: IndicatorRepository;
  let unitRepository: UnitRepository;
  let unitConversionRepository: UnitConversionRepository;
  const fakeTable = 'faketable';
  const fakeTable2 = 'faketable2';
  const fakeColumn = 'fakecolumn';
  const fakeColumn2 = 'fakecolumn2';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);
    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);
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
    await dropH3DataMock([fakeTable, fakeTable2]);
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await indicatorRepository.delete({});
    await unitConversionRepository.delete({});
    await unitRepository.delete({});
  });

  afterAll(async () => {
    return app.close();
  });

  test('When I get a calculated H3 Risk Map without any of the required parameters, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/map/risk`,
    );
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'indicatorId should not be empty',
      'indicatorId must be a UUID',
      'year should not be empty',
      'year must be a number conforming to the specified constraints',
      'materialId must be a UUID',
      'materialId should not be empty',
      'Available resolutions: 1 to 6',
      'resolution must be a number conforming to the specified constraints',
      'resolution should not be empty',
    ]);
  });

  test('When I get a calculated H3 Risk Map without an indicator id, then I should get a proper error message', async () => {
    const material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        materialId: material.id,
        resolution: 1,
        year: 2021,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'indicatorId should not be empty',
      'indicatorId must be a UUID',
    ]);
  });

  test('When I get a calculated H3 Risk Map without a year value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        materialId: material.id,
        resolution: 1,
      });

    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'year should not be empty',
      'year must be a number conforming to the specified constraints',
    ]);
  });

  test('When I get a calculated H3 Risk Map without a material id value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        resolution: 1,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'materialId must be a UUID',
      'materialId should not be empty',
    ]);
  });

  test('When I get a calculated H3 Risk Map without a resolution value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const material = await createMaterial({ name: 'Material with no H3' });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'Available resolutions: 1 to 6',
      'resolution must be a number conforming to the specified constraints',
      'resolution should not be empty',
    ]);
  });

  test('When I get a calculated H3 Water Risk Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable,
      fakeColumn,
    });
    jest.spyOn(h3DataRepository, 'getWaterRiskMapByResolution');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
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
        v: 103,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [103, 103, 103, 103, 103, 103, 103],
      unit: 'tonnes',
    });
  });
  test('When I get a calculated H3 Biodiversity Loss Risk Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const deforestationIndicator = await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    const deforestationH3Data = await h3DataMock(
      'fake2',
      'fake3',
      null,
      deforestationIndicator.id,
    );
    const { material, indicator, h3Data, unitConversion } =
      await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
        fakeTable,
        fakeColumn,
      });
    jest.spyOn(h3DataRepository, 'getBiodiversityLossRiskMapByResolution');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(
      h3DataRepository.getBiodiversityLossRiskMapByResolution,
    ).toHaveBeenCalledWith(
      h3Data,
      h3Data,
      h3Data,
      deforestationH3Data,
      unitConversion.factor,
      6,
    );

    expect(response.body.data).toEqual([
      {
        h: '861203a4fffffff',
        v: 10000000000,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [
        10000000000, 10000000000, 10000000000, 10000000000, 10000000000,
        10000000000, 10000000000,
      ],
      unit: 'tonnes',
    });
  });
  test('When I get a calculated H3 Carbon Emission Risk Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const deforestationIndicator = await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    const deforestationH3Data = await h3DataMock(
      fakeTable2,
      fakeColumn2,
      null,
      deforestationIndicator.id,
    );
    const { material, indicator, h3Data, unitConversion } =
      await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.CARBON_EMISSIONS,
        fakeTable,
        fakeColumn,
      });
    jest.spyOn(h3DataRepository, 'getCarbonEmissionsRiskMapByResolution');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });
    expect(
      h3DataRepository.getCarbonEmissionsRiskMapByResolution,
    ).toHaveBeenCalledWith(
      h3Data,
      h3Data,
      h3Data,
      deforestationH3Data,
      unitConversion.factor,
      6,
    );

    expect(response.body.data).toEqual([
      {
        h: '861203a4fffffff',
        v: 1000000,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [
        1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000,
      ],
      unit: 'tonnes',
    });
  });
  // TODO: Update assertion as soon as actual calculus is validated
  test('When I get a calculated H3 Deforestation Loss Risk Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const { material, indicator, h3Data } =
      await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.DEFORESTATION,
        fakeTable,
        fakeColumn,
      });
    jest.spyOn(h3DataRepository, 'getDeforestationLossRiskMapByResolution');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(
      h3DataRepository.getDeforestationLossRiskMapByResolution,
    ).toHaveBeenCalledWith(h3Data, h3Data, h3Data, 6);
    expect(response.body.data).toEqual([
      {
        h: '861203a4fffffff',
        v: 1000,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [1000, 1000, 1000, 1000, 1000, 1000, 1000],
      unit: 'tonnes',
    });
  });

  test('When I query a Biodiversity Risk-Map, but there is no previous Deforestation indicator present in DB which is required for calculate the map, then I should get a proper error message', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
      fakeTable,
      fakeColumn,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(response.body.errors[0].meta.rawError.response.message).toEqual(
      'No Deforestation Indicator data found in database',
    );
  });
  test('When I query a Biodiversity Risk-Map, but there is no H3 data associated to a existing Deforestation indicator present in DB which is required for calculate the map, then I should get a proper error message', async () => {
    await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
      fakeTable,
      fakeColumn,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(response.body.errors[0].meta.rawError.response.message).toEqual(
      'No Deforestation Indicator H3 data found in database, required to retrieve Biodiversity Loss and Carbon Risk-Maps',
    );
  });
});
