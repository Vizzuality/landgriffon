import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
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
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';

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
      imports: [AppModule, H3DataModule],
    }).compile();

    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);
    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);
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
    await h3DataRepository.delete({});
    await indicatorRepository.delete({});
    await unitConversionRepository.delete({});
    await unitRepository.delete({});
    await dropFakeH3Data([INDICATOR_FAKE_H3_TABLE, MATERIAL_FAKE_H3_TABLE]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('When I try to GET a Risk-Map but the query parameters are not valid, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
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
        'resolution should not be empty',
        'resolution must be a number conforming to the specified constraints',
        'Available resolutions: 1 to 6',
      ],
    );
  });

  test('When I try to GET a Risk-Map with correct queries, but there is no H3 Data available for requested Indicator, then I should get a proper error message', async () => {
    const unit = await createUnit();
    const indicator = await createIndicator({ unit, name: 'Indicator Name' });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        indicatorId: indicator.id,
        resolution: 1,
        year: 2020,
        materialId: FAKE_UUID,
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
    const h3Data = await createFakeH3Data(
      INDICATOR_FAKE_H3_TABLE,
      INDICATOR_FAKE_H3_COLUMN,
      false,
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

  test('Given there is H3 Data available, When I try to GET a Risk-Map with proper query parameters, then I should get a calculated Risk-Map', async () => {
    const materialH3Data = await createFakeH3Data(
      MATERIAL_FAKE_H3_TABLE,
      MATERIAL_FAKE_H3_COLUMN,
      h3MaterialFixtures,
    );

    const material = await createMaterial({
      name: 'Material Name',
      harvest: materialH3Data,
    });

    const unit = await createUnit();
    await createUnitConversion({ unit });
    const indicator = await createIndicator({
      unit,
      name: 'Indicator Name',
      nameCode: 'UWU_T',
    });
    const indicatorH3Data = await createFakeH3Data(
      INDICATOR_FAKE_H3_TABLE,
      INDICATOR_FAKE_H3_COLUMN,
      h3IndicatorFixtures,
      indicator.id,
    );

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/risk`)
      .query({
        materialId: material.id,
        indicatorId: indicator.id,
        resolution: 6,
        year: 2020,
      });

    expect(response.body.data.length).toEqual(384);
  });
});
