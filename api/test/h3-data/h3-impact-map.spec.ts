import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import { createFakeH3Data, dropFakeH3Data } from './mocks/create-fake-h3-data';
import { createMaterial } from '../entity-mocks';
import { MaterialRepository } from '../../src/modules/materials/material.repository';
import { Indicator } from '../../src/modules/indicators/indicator.entity';
import { IndicatorRepository } from '../../src/modules/indicators/indicator.repository';
import { Unit } from '../../src/modules/units/unit.entity';
import { UnitConversion } from '../../src/modules/unit-conversions/unit-conversion.entity';
import { UnitRepository } from '../../src/modules/units/unit.repository';
import { UnitConversionRepository } from '../../src/modules/unit-conversions/unit-conversion.repository';

/**
 * Tests for the H3DataModule.
 */

describe('H3 Data Module (e2e) - Impact map', () => {
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

  test('When I get a calculated H3 Impact Map without any of the required parameters, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/impact-map`,
    );
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'indicators should not be empty',
      'each value in indicators must be a string',
      'materials should not be empty',
      'each value in materials must be a string',
      'startYear should not be empty',
      'startYear must be a number conforming to the specified constraints',
      'endYear should not be empty',
      'endYear must be a number conforming to the specified constraints',
    ]);
  });

  test('When I get a calculated H3 Impact Map without a start and end year values, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicators: [indicator.id],
        materials: [material.id],
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'startYear should not be empty',
      'startYear must be a number conforming to the specified constraints',
      'endYear should not be empty',
      'endYear must be a number conforming to the specified constraints',
    ]);
  });

  test('When I get a calculated H3 Impact Map without a material id value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicators: [indicator.id],
        startYear: 2020,
        endYear: 2020,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'materials should not be empty',
      'each value in materials must be a string',
    ]);
  });

  test('When I get a calculated H3 Impact Map without a start year value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicators: [indicator.id],
        materials: [material.id],
        endYear: 2020,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'Value startYear (undefined) must be smaller or equal than the value of endYear (2020)',
      'startYear should not be empty',
      'startYear must be a number conforming to the specified constraints',
      'Value endYear (2020) must be greater or equal than the value of startYear (undefined)',
    ]);
  });

  test('When I get a calculated H3 Impact Map start year greater than end year, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicators: [indicator.id],
        materials: [material.id],
        endYear: 2020,
        startYear: 2021,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'Value startYear (2021) must be smaller or equal than the value of endYear (2020)',
      'Value endYear (2020) must be greater or equal than the value of startYear (2021)',
    ]);
  });

  test.skip('When I get a calculated H3 Water Impact Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const unit: Unit = new Unit();
    unit.name = 'test unit';
    unit.symbol = 'tonnes';
    await unit.save();

    const unitConversion: UnitConversion = new UnitConversion();
    unitConversion.unit = unit;
    unitConversion.factor = 1;
    await unitConversion.save();

    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    indicator.unit = unit;
    indicator.nameCode = 'UWU_T';
    await indicator.save();

    const h3Data = await createFakeH3Data(
      fakeTable,
      fakeColumn,
      null,
      indicator.id,
    );

    const material = await createMaterial({
      name: 'Material with no H3',
      harvestId: h3Data.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicators: [indicator.id],
        materials: [material.id],
        endYear: 2020,
        startYear: 2020,
      });

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
});
