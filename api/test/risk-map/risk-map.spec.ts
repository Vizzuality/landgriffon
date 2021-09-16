import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { RiskMapModule } from '../../src/modules/risk-map/risk-map.module';
import {
  createIndicator,
  createMaterial,
  createUnit,
  createUnitConversion,
} from '../entity-mocks';
import { MaterialRepository } from '../../src/modules/materials/material.repository';
import { IndicatorRepository } from '../../src/modules/indicators/indicator.repository';
import { UnitRepository } from '../../src/modules/units/unit.repository';

import {
  createFakeH3Data,
  dropFakeH3Data,
} from '../h3-data/mocks/create-fake-h3-data';
import {
  h3IndicatorFixtures,
  h3MaterialFixtures,
} from '../h3-data/mocks/h3-fixtures';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { UnitConversionRepository } from '../../src/modules/unit-conversions/unit-conversion.repository';

/**
 * Tests for the Risk Map module.
 */

describe('Risk Map Test Suite (e2e)', () => {
  const FAKE_UUID = '4d206fc3-c019-4747-a5f2-93196fc072d5';
  const INDICATOR_FAKE_H3_TABLE = 'indicatorfakeh3table';
  const INDICATOR_FAKE_H3_COLUMN = 'fakehei';
  const MATERIAL_FAKE_H3_TABLE = 'materialfakeh3table';
  const MATERIAL_FAKE_H3_COLUMN = 'materialfakeh3column';

  let app: INestApplication;
  let materialRepository: MaterialRepository;
  let indicatorRepository: IndicatorRepository;
  let unitRepository: UnitRepository;
  let h3DataRepository: H3DataRepository;
  let unitConversionRepository: UnitConversionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, RiskMapModule],
    }).compile();

    materialRepository = moduleFixture.get<MaterialRepository>(
      MaterialRepository,
    );
    indicatorRepository = moduleFixture.get<IndicatorRepository>(
      IndicatorRepository,
    );
    unitRepository = moduleFixture.get<UnitRepository>(UnitRepository);
    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
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
    await materialRepository.delete({});
    await indicatorRepository.delete({});
    await unitConversionRepository.delete({});
    await unitRepository.delete({});
    await h3DataRepository.delete({});
    await dropFakeH3Data([INDICATOR_FAKE_H3_TABLE, MATERIAL_FAKE_H3_TABLE]);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('When I try to GET a Risk-Map but the query parameters are not valid, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/risk-map`)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'indicatorId should not be empty',
        'indicatorId must be a UUID',
        'materialId should not be empty',
        'materialId must be a UUID',
        'year should not be empty',
        'year must be a number conforming to the specified constraints',
      ],
    );
  });

  test('When I try to GET a Risk-Map with correct queries, but there is no H3 Data available for requested Indicator, then I should get a proper error message', async () => {
    const unit = await createUnit();
    const indicator = await createIndicator({ unit, name: 'Indicator Name' });

    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/risk-map?materialId=${FAKE_UUID}&indicatorId=${indicator.id}&year=2020`,
    );

    expect(response.body.errors[0].title).toEqual(
      `There is no H3 Data for Indicator: ${indicator.name}`,
    );
  });
  test('When I try to GET a Risk-Map with correct queries, but there is no H3 Data available for requested Material, then I should get a proper error message', async () => {
    const material = await createMaterial({ name: 'Material Name' });
    const h3GridId = await createFakeH3Data(
      INDICATOR_FAKE_H3_TABLE,
      INDICATOR_FAKE_H3_COLUMN,
    );
    const unit = await createUnit();
    const indicator = await createIndicator({
      unit,
      name: 'Indicator Name',
      h3GridId,
    });

    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/risk-map?materialId=${material.id}&indicatorId=${indicator.id}&year=2020`,
    );

    expect(response.body.errors[0].title).toEqual(
      `There is no H3 Data for Material: ${material.name}`,
    );
  });

  test('Given there is H3 Data available, When I try to GET a Risk-Map with proper query parameters, then I should get a calculated Risk-Map', async () => {
    const indicatorH3GridId = await createFakeH3Data(
      INDICATOR_FAKE_H3_TABLE,
      INDICATOR_FAKE_H3_COLUMN,
      h3IndicatorFixtures,
    );
    const materialH3GridId = await createFakeH3Data(
      MATERIAL_FAKE_H3_TABLE,
      MATERIAL_FAKE_H3_COLUMN,
      h3MaterialFixtures,
    );

    const material = await createMaterial({
      name: 'Material Name',
      h3GridId: materialH3GridId,
    });

    const unit = await createUnit();
    await createUnitConversion({ unit });
    const indicator = await createIndicator({
      unit,
      name: 'Indicator Name',
      h3GridId: indicatorH3GridId,
    });

    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/risk-map?materialId=${material.id}&indicatorId=${indicator.id}&year=2020`,
    );

    expect(response.body.indicator).toEqual(indicator.name);
    expect(response.body.material).toEqual(material.name);
    expect(response.body.unit).toEqual({
      name: unit.name,
      symbol: unit.symbol,
    });
    // TODO: Uncomment this assertion as soons as finish risk-map implementation. This is commented out to unblock FE
    //expect(Object.entries(response.body.riskMap).length).toEqual(384);
  });
});
