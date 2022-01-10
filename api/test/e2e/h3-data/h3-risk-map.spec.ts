import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { dropH3DataMock, h3DataMock } from './mocks/h3-data.mock';
import {
  createIndicator,
  createMaterial,
  createMaterialToH3,
  createUnit,
} from '../../entity-mocks';
import { MaterialRepository } from 'modules/materials/material.repository';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { UnitRepository } from 'modules/units/unit.repository';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';
import { createWorldForRiskMapGeneration } from './mocks/h3-risk-map.mock';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import {
  h3DeforestationExampleDataFixture,
  h3IndicatorExampleDataFixture,
  h3MaterialExampleDataFixture,
} from './mocks/h3-fixtures';
import { riskMapCalculationResults } from './mocks/h3-risk-map-calculation-results';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { E2E_CONFIG } from '../../e2e.config';

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
  let jwtToken: string;

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

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(E2E_CONFIG.users.signUp)
      .expect(HttpStatus.CREATED);
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(E2E_CONFIG.users.signIn)
      .expect(HttpStatus.CREATED);
    jwtToken = response.body.accessToken;
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await dropH3DataMock([
      'fakeMaterialTable',
      'fakeMaterialTable2002',
      'fakeIndicatorTable',
      'fakeIndicatorTable2003',
      'fakeDeforestationTable',
    ]);
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await indicatorRepository.delete({});
    await unitConversionRepository.delete({});
    await unitRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Missing input values', () => {
    test('When I get a calculated H3 Risk Map without any of the required parameters, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/risk`)
        .set('Authorization', `Bearer ${jwtToken}`);
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
  });

  describe('Missing data', () => {
    test('When I try to GET a Risk-Map with correct queries, but there is no H3 Data available for requested Indicator, then I should get a proper error message', async () => {
      const { material, indicator } = await createWorldForRiskMapGeneration({
        indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
        fakeTable: 'fakeMaterialTable',
        fakeColumn: 'fakeMaterialColumn',
        year: 2010,
      });
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/risk`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: indicator.id,
          resolution: 1,
          year: 2020,
          materialId: material.id,
        });
      expect(response.body.errors[0].title).toEqual(
        `There is no H3 Data registered for Indicator with ID ${indicator.id} for year 2020 or any other year`,
      );
    });

    test('When I try to GET a Risk-Map with correct queries, but there is no H3 harvest data available for requested Material, then I should get a proper error message', async () => {
      const unit = await createUnit();
      const indicator = await createIndicator({
        unit,
        name: 'Indicator Name',
      });
      await h3DataMock({
        h3TableName: 'fakeIndicatorTable',
        h3ColumnName: 'fakeIndicatorColumn',
        additionalH3Data: h3IndicatorExampleDataFixture,
        indicatorId: indicator.id,
        year: 2005,
      });
      const material = await createMaterial({
        name: 'Material Name',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/risk`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          materialId: material.id,
          indicatorId: indicator.id,
          resolution: 1,
          year: 2020,
        });

      expect(response.body.errors[0].title).toEqual(
        `There is no H3 Harvest data registered for Material with ID ${material.id} for year 2020 or any other year`,
      );
    });

    test('When I try to GET a Risk-Map with correct queries, but there is no H3 producer data available for requested Material, then I should get a proper error message', async () => {
      const unit = await createUnit();
      const indicator = await createIndicator({
        unit,
        name: 'Indicator Name',
      });
      await h3DataMock({
        h3TableName: 'fakeIndicatorTable',
        h3ColumnName: 'fakeIndicatorColumn',
        additionalH3Data: h3IndicatorExampleDataFixture,
        indicatorId: indicator.id,
        year: 2020,
      });

      const h3Data = await h3DataMock({
        h3TableName: 'fakeMaterialTable',
        h3ColumnName: 'fakeMaterialColumn',
        additionalH3Data: h3MaterialExampleDataFixture,
        year: 2010,
      });

      const material = await createMaterial({
        name: 'Material Name',
      });

      await createMaterialToH3(
        material.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/risk`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          materialId: material.id,
          indicatorId: indicator.id,
          resolution: 1,
          year: 2020,
        });

      expect(response.body.errors[0].title).toEqual(
        `There is no H3 Producer data registered for Material with ID ${material.id} for year 2020 or any other year`,
      );
    });
  });

  test('When I get a calculated H3 Water Risk Map with the necessary input values, then I should get the h3 data (happy case). H3 data for the requested year is available, calculations are based on that data', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2020,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2020,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    expect(response.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.waterRiskRes6Values),
    );
    expect(response.body.metadata).toEqual(
      riskMapCalculationResults.waterRiskRes6Quantiles2020,
    );
  });

  test('When I get a calculated H3 Water Risk Map with the necessary input values, then I should get the h3 data (happy case). Material and indicator h3 data not available for requested year - data for the next available lower year is used. Different results for different resolutions expected', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.waterRiskRes6Values),
    );
    expect(responseRes6.body.metadata).toEqual(
      riskMapCalculationResults.waterRiskRes6Quantiles,
    );
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.waterRiskRes3Values),
    );
    expect(responseRes3.body.metadata).toEqual(
      riskMapCalculationResults.waterRiskRes3Quantiles,
    );
  });

  test('H3 Water Risk Map happy case - h3 data is not available the requested year or for any lower year, h3 data for nearest higher year is used for calculations', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    // Creating extra fake h3 tables for nearest future years

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable2003',
      h3ColumnName: 'fakeIndicatorColumn2003',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2003,
    });

    const laterH3MaterialData = await h3DataMock({
      h3TableName: 'fakeMaterialTable2002',
      h3ColumnName: 'fakeMaterialColumn2002',
      additionalH3Data: h3MaterialExampleDataFixture,
      year: 2002,
    });

    await createMaterialToH3(
      material.id,
      laterH3MaterialData.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    await createMaterialToH3(
      material.id,
      laterH3MaterialData.id,
      MATERIAL_TO_H3_TYPE.HARVEST,
    );

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2000,
        materialId: material.id,
        resolution: 6,
      });

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.waterRiskRes6Values),
    );
    expect(responseRes6.body.metadata).toEqual(
      riskMapCalculationResults.waterRiskRes6Quantiles2002,
    );
  });

  test('When I get a calculated H3 Water Risk Map with the necessary input values and there is h3 data available for multiple years before the requested one, the data for the nearest lower year is taken for calculations. Different results for different resolutions expected', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    // Creating extra fake h3 tables for earlier years

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable2003',
      h3ColumnName: 'fakeIndicatorColumn2003',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2003,
    });

    const earlierH3MaterialData = await h3DataMock({
      h3TableName: 'fakeMaterialTable2002',
      h3ColumnName: 'fakeMaterialColumn2002',
      additionalH3Data: h3MaterialExampleDataFixture,
      year: 2002,
    });

    await createMaterialToH3(
      material.id,
      earlierH3MaterialData.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    await createMaterialToH3(
      material.id,
      earlierH3MaterialData.id,
      MATERIAL_TO_H3_TYPE.HARVEST,
    );

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.waterRiskRes6Values),
    );
    expect(responseRes6.body.metadata).toEqual(
      riskMapCalculationResults.waterRiskRes6Quantiles,
    );
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.waterRiskRes3Values),
    );
    expect(responseRes3.body.metadata).toEqual(
      riskMapCalculationResults.waterRiskRes3Quantiles,
    );
  });

  test('When I get a calculated H3 Biodiversity Loss Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const deforestationIndicator = await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    await h3DataMock({
      h3TableName: 'fakeDeforestationTable',
      h3ColumnName: 'fakeDeforestationColumn',
      additionalH3Data: h3DeforestationExampleDataFixture,
      indicatorId: deforestationIndicator.id,
      year: 2005,
    });
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(
        riskMapCalculationResults.biodiversityLossRes6Values,
      ),
    );
    expect(responseRes6.body.metadata).toEqual(
      riskMapCalculationResults.biodiversityLossRes6Quantiles,
    );
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(
        riskMapCalculationResults.biodiversityLossRes3Values,
      ),
    );
    expect(responseRes3.body.metadata).toEqual(
      riskMapCalculationResults.biodiversityLossRes3Quantiles,
    );
  });

  test('When I get a calculated H3 Carbon Emission Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const deforestationIndicator = await createIndicator({
      name: 'another indicator',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    await h3DataMock({
      h3TableName: 'fakeDeforestationTable',
      h3ColumnName: 'fakeDeforestationColumn',
      additionalH3Data: h3DeforestationExampleDataFixture,
      indicatorId: deforestationIndicator.id,
      year: 2005,
    });
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.CARBON_EMISSIONS,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(
        riskMapCalculationResults.carbonEmissionsRes6Values,
      ),
    );
    expect(responseRes6.body.metadata).toEqual(
      riskMapCalculationResults.carbonEmissionsRes6Quantiles,
    );
    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(
        riskMapCalculationResults.carbonEmissionsRes3Values,
      ),
    );
    expect(responseRes3.body.metadata).toEqual(
      riskMapCalculationResults.carbonEmissionsRes3Quantiles,
    );
  });

  test('When I get a calculated H3 Deforestation Loss Risk Map with the necessary input values, then I should get the h3 data (happy case). Different results for different resolutions expected', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.DEFORESTATION,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });
    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    const responseRes6 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 6,
      });

    const responseRes3 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        materialId: material.id,
        resolution: 3,
      });

    expect(responseRes6.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.deforestationRes6Values),
    );
    expect(responseRes6.body.metadata).toEqual(
      riskMapCalculationResults.deforestationRes6Quantiles,
    );

    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining(riskMapCalculationResults.deforestationRes3Values),
    );
    expect(responseRes3.body.metadata).toEqual(
      riskMapCalculationResults.deforestationRes3Quantiles,
    );
  });

  test('When I query a Biodiversity Risk-Map, but there is no previous Deforestation indicator present in DB which is required for calculate the map, then I should get a proper error message', async () => {
    const { material, indicator } = await createWorldForRiskMapGeneration({
      indicatorType: INDICATOR_TYPES.BIODIVERSITY_LOSS,
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
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
      fakeTable: 'fakeMaterialTable',
      fakeColumn: 'fakeMaterialColumn',
      year: 2010,
    });

    await h3DataMock({
      h3TableName: 'fakeIndicatorTable',
      h3ColumnName: 'fakeIndicatorColumn',
      additionalH3Data: h3IndicatorExampleDataFixture,
      indicatorId: indicator.id,
      year: 2005,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .set('Authorization', `Bearer ${jwtToken}`)
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
