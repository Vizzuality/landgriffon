import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { dropFakeH3Data } from './mocks/create-fake-h3-data';

import { MaterialRepository } from 'modules/materials/material.repository';

import { IndicatorRepository } from 'modules/indicators/indicator.repository';

import { UnitRepository } from 'modules/units/unit.repository';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';

/**
 * Tests for the H3DataModule.
 */

describe('H3 Data Module (e2e) - Impact Table', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  let indicatorRepository: IndicatorRepository;
  let unitRepository: UnitRepository;
  let unitConversionRepository: UnitConversionRepository;
  const fakeTable = 'faketable';

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

  test('When I request a Impact map without any of the required values, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/impact-table`,
    );
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'each value in indicatorIds must be a string',
      'indicatorIds should not be empty',
      'startYear should not be empty',
      'startYear must be a number conforming to the specified constraints',
      'endYear should not be empty',
      'endYear must be a number conforming to the specified constraints',
      'groupBy must be a valid enum value',
      'groupBy should not be empty',
      'groupBy must be a string',
    ]);
  });
});
