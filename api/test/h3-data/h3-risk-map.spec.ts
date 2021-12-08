import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import { dropH3DataMock, h3DataMock } from './mocks/h3-data.mock';
import { createIndicator, createMaterial, createUnit } from '../entity-mocks';
import { MaterialRepository } from '../../src/modules/materials/material.repository';
import {
  Indicator,
  INDICATOR_TYPES,
} from '../../src/modules/indicators/indicator.entity';
import { IndicatorRepository } from '../../src/modules/indicators/indicator.repository';
import { UnitRepository } from '../../src/modules/units/unit.repository';
import { UnitConversionRepository } from '../../src/modules/unit-conversions/unit-conversion.repository';
import { createWorldForRiskMapGeneration } from './mocks/h3-risk-map.mock';
import { MaterialsToH3sService } from '../../src/modules/materials/materials-to-h3s.service';
import { h3BasicFixture } from './mocks/h3-fixtures';
import {
  h3AlternativeDeforestationFixture,
  h3AlternativeIndicatorFixture,
} from './mocks/h3-alternative-fixture';
import {
  expectedBiodiversityLossRes3Data,
  expectedBiodiversityLossRes3Metadata,
  expectedBiodiversityLossRes6Data,
  expectedBiodiversityLossRes6Metadata,
  expectedCarbonEmissionsRes3Data,
  expectedCarbonEmissionsRes3Metadata,
  expectedCarbonEmissionsRes6Data,
  expectedCarbonEmissionsRes6Metadata,
  expectedDeforestationRes3Data,
  expectedDeforestationRes3Metadata,
  expectedDeforestationRes6Data,
  expectedDeforestationRes6Metadata,
  expectedWaterRiskRes3Data,
  expectedWaterRiskRes3Metadata,
  expectedWaterRiskRes6Data,
  expectedWaterRiskRes6Metadata,
} from './expected-responses/risk-map-expected';

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
  let materialToH3Service: MaterialsToH3sService;
  let indicatorRepository: IndicatorRepository;
  let unitRepository: UnitRepository;
  let unitConversionRepository: UnitConversionRepository;
  const fakeTable = 'faketable';
  const fakeTable2 = 'faketable2';
  const fakeTable3 = 'faketable3';
  const fakeColumn = 'fakecolumn';
  const fakeColumn2 = 'fakecolumn2';
  const fakeColumn3 = 'fakecolumn3';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);
    materialToH3Service = moduleFixture.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
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
    await materialToH3Service.delete({});
    await dropH3DataMock([fakeTable, fakeTable2, fakeTable3]);
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

  test('When I try to GET a Risk-Map with correct queries, but there is no H3 Data available for requested Indicator, then I should get a proper error message', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable,
      fakeColumn,
      year: 2020,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        resolution: 1,
        year: 2020,
        materialId: material.id,
      });
    expect(response.body.errors[0].title).toEqual(
      `There is no H3 Data for Indicator with ID: ${indicator.id}`,
    );
  });

  test('When I try to GET a Risk-Map with correct queries, but there is no H3 Data available for requested Material, then I should get a proper error message', async () => {
    const unit = await createUnit();
    const indicator = await createIndicator({
      unit,
      name: 'Indicator Name',
    });
    await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );
    const material = await createMaterial({
      name: 'Material Name',
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        materialId: material.id,
        indicatorId: indicator.id,
        resolution: 1,
        year: 2020,
      });

    expect(response.body.errors[0].title).toEqual(
      `There is no H3 Data for Material with ID: ${material.id}`,
    );
  });

  test('When I get a calculated H3 Water Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable,
      fakeColumn,
    });

    await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );

    jest.spyOn(h3DataRepository, 'getWaterRiskMapByResolution');

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(h3DataRepository.getWaterRiskMapByResolution).toHaveBeenCalledTimes(
      2,
    );

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(expectedWaterRiskRes6Data),
    );
    expect(responseRes6.body.metadata).toEqual(expectedWaterRiskRes6Metadata);
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(expectedWaterRiskRes3Data),
    );
    expect(responseRes3.body.metadata).toEqual(expectedWaterRiskRes3Metadata);
  });

  test('When I get a calculated H3 Biodiversity Loss Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const deforestationIndicator = await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    const deforestationH3Data = await h3DataMock({
      h3TableName: 'fake2',
      h3ColumnName: 'fake3',
      indicatorId: deforestationIndicator.id,
      year: 2020,
    });
    const { material, indicator, h3Data, unitConversion } =
      await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
        fakeTable,
        fakeColumn,
        year: 2020,
      });

    const indicatorH3Data = await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );
    jest.spyOn(h3DataRepository, 'getBiodiversityLossRiskMapByResolution');

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(
      h3DataRepository.getBiodiversityLossRiskMapByResolution,
    ).toHaveBeenCalledWith(
      indicatorH3Data,
      h3Data,
      h3Data,
      deforestationH3Data,
      unitConversion.factor,
      6,
    );
    expect(
      h3DataRepository.getBiodiversityLossRiskMapByResolution,
    ).toHaveBeenCalledWith(
      indicatorH3Data,
      h3Data,
      h3Data,
      deforestationH3Data,
      unitConversion.factor,
      3,
    );

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(expectedBiodiversityLossRes6Data),
    );
    expect(responseRes6.body.metadata).toEqual(
      expectedBiodiversityLossRes6Metadata,
    );
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(expectedBiodiversityLossRes3Data),
    );
    expect(responseRes3.body.metadata).toEqual(
      expectedBiodiversityLossRes3Metadata,
    );
  });
  test('When I get a calculated H3 Carbon Emission Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const deforestationIndicator = await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    const deforestationH3Data = await h3DataMock({
      h3TableName: fakeTable2,
      h3ColumnName: fakeColumn2,
      indicatorId: deforestationIndicator.id,
      year: 2020,
    });
    const { material, indicator, h3Data, unitConversion } =
      await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.CARBON_EMISSIONS,
        fakeTable,
        fakeColumn,
        year: 2020,
      });

    const indicatorH3Data = await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );
    jest.spyOn(h3DataRepository, 'getCarbonEmissionsRiskMapByResolution');

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(
      h3DataRepository.getCarbonEmissionsRiskMapByResolution,
    ).toHaveBeenCalledWith(
      indicatorH3Data,
      h3Data,
      h3Data,
      deforestationH3Data,
      unitConversion.factor,
      6,
    );
    expect(
      h3DataRepository.getCarbonEmissionsRiskMapByResolution,
    ).toHaveBeenCalledWith(
      indicatorH3Data,
      h3Data,
      h3Data,
      deforestationH3Data,
      unitConversion.factor,
      3,
    );
    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(expectedCarbonEmissionsRes6Data),
    );
    expect(responseRes6.body.metadata).toEqual(
      expectedCarbonEmissionsRes6Metadata,
    );
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(expectedCarbonEmissionsRes3Data),
    );
    expect(responseRes3.body.metadata).toEqual(
      expectedCarbonEmissionsRes3Metadata,
    );
  });

  // TODO: Update assertion as soon as actual calculus is validated
  test('When I get a calculated H3 Deforestation Loss Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const { material, indicator, h3Data } =
      await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.DEFORESTATION,
        fakeTable,
        fakeColumn,
        year: 2020,
      });
    const indicatorH3Data = await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );
    jest.spyOn(h3DataRepository, 'getDeforestationLossRiskMapByResolution');

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(
      h3DataRepository.getDeforestationLossRiskMapByResolution,
    ).toHaveBeenCalledWith(indicatorH3Data, h3Data, h3Data, 6);
    expect(
      h3DataRepository.getDeforestationLossRiskMapByResolution,
    ).toHaveBeenCalledWith(indicatorH3Data, h3Data, h3Data, 3);

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(expectedDeforestationRes6Data),
    );
    expect(responseRes6.body.metadata).toEqual(
      expectedDeforestationRes6Metadata,
    );

    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(expectedDeforestationRes3Data),
    );
    expect(responseRes3.body.metadata).toEqual(
      expectedDeforestationRes3Metadata,
    );
  });

  test('When I query a Biodiversity Risk-Map, but there is no previous Deforestation indicator present in DB which is required for calculate the map, then I should get a proper error message', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
      fakeTable,
      fakeColumn,
      year: 2020,
    });

    const indicatorH3Data = await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );

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
      year: 2020,
    });

    const indicatorH3Data = await h3DataMock(
      fakeTable2,
      fakeColumn2,
      h3AlternativeIndicatorFixture,
      indicator.id,
    );

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
