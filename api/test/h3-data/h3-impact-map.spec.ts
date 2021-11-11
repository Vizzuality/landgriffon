import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { createFakeH3Data, dropFakeH3Data } from './mocks/create-fake-h3-data';
import {
  createMaterial,
  createGeoRegion,
  createSourcingLocation,
  createSourcingRecord,
  createIndicatorRecord,
} from '../entity-mocks';
import { MaterialRepository } from 'modules/materials/material.repository';
import { Indicator } from 'modules/indicators/indicator.entity';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { Unit } from 'modules/units/unit.entity';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { UnitRepository } from 'modules/units/unit.repository';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';
import { Material } from 'modules/materials/material.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';

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
      'indicatorId should not be empty',
      'indicatorId must be a string',
      'year should not be empty',
      'year must be a number conforming to the specified constraints',
      'groupBy must be a valid enum value',
      'groupBy should not be empty',
      'groupBy must be a string',
      'Available resolutions: 1 to 6',
      'resolution must not be greater than 6',
      'resolution must not be less than 1',
      'resolution must be a number conforming to the specified constraints',
      'resolution should not be empty',
    ]);
  });

  test('When I get a calculated H3 Impact Map without a year value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicators: indicator.id,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'property indicators should not exist',
      'indicatorId should not be empty',
      'indicatorId must be a string',
      'year should not be empty',
      'year must be a number conforming to the specified constraints',
      'groupBy must be a valid enum value',
      'groupBy should not be empty',
      'groupBy must be a string',
      'Available resolutions: 1 to 6',
      'resolution must not be greater than 6',
      'resolution must not be less than 1',
      'resolution must be a number conforming to the specified constraints',
      'resolution should not be empty',
    ]);
  });

  test('When I get a calculated H3 Impact Map without a group by value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'groupBy must be a valid enum value',
      'groupBy should not be empty',
      'groupBy must be a string',
      'Available resolutions: 1 to 6',
      'resolution must not be greater than 6',
      'resolution must not be less than 1',
      'resolution must be a number conforming to the specified constraints',
      'resolution should not be empty',
    ]);
  });

  test('When I get a calculated H3 Impact Map without a resolution value, then I should get a proper error message', async () => {
    const indicator: Indicator = new Indicator();
    indicator.name = 'test indicator';
    await indicator.save();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        groupBy: 'material',
      });
    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'Available resolutions: 1 to 6',
      'resolution must not be greater than 6',
      'resolution must not be less than 1',
      'resolution must be a number conforming to the specified constraints',
      'resolution should not be empty',
    ]);
  });

  test('When I get a calculated H3 Water Impact Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
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

    const harvestH3Data = await createFakeH3Data(
      'harvestTable',
      'harvestColumn',
      null,
      indicator.id,
    );

    const productionH3Data = await createFakeH3Data(
      'productionTable',
      'productionColumn',
      null,
      indicator.id,
    );

    const material: Material = await createMaterial({
      name: 'Material with no H3',
      producerId: productionH3Data.id,
      harvestId: harvestH3Data.id,
    });

    const geoRegionOne: GeoRegion = await createGeoRegion({
      h3Compact: ['861203a4fffffff', '861203a5fffffff'],
    });

    const sourcingLocationOne: SourcingLocation = await createSourcingLocation({
      geoRegion: geoRegionOne,
      material,
    });

    const sourcingRecordOne: SourcingRecord = await createSourcingRecord({
      sourcingLocation: sourcingLocationOne,
    });

    const indicatorRecordOne: IndicatorRecord = await createIndicatorRecord({
      sourcingRecordId: sourcingRecordOne.id,
      indicatorId: indicator.id,
      value: 1234,
    });

    const geoRegionTwo: GeoRegion = await createGeoRegion({
      h3Compact: ['861203a4fffffff', '861203a6fffffff'],
      name: 'DEF',
    });

    const sourcingLocationTwo: SourcingLocation = await createSourcingLocation({
      geoRegion: geoRegionTwo,
      material,
    });

    const sourcingRecordTwo: SourcingRecord = await createSourcingRecord({
      sourcingLocation: sourcingLocationTwo,
    });

    const indicatorRecordTwo: IndicatorRecord = await createIndicatorRecord({
      sourcingRecordId: sourcingRecordTwo.id,
      indicatorId: indicator.id,
      value: 1000,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/impact-map`)
      .query({
        indicatorId: indicator.id,
        year: 2020,
        groupBy: 'material',
        resolution: 6,
      });

    expect(response.body.data).toEqual([
      {
        h: '861203a6fffffff',
        v: 500,
      },
      {
        h: '861203a4fffffff',
        v: 1117,
      },
      {
        h: '861203a5fffffff',
        v: 617,
      },
    ]);
    expect(response.body.metadata).toEqual({
      quantiles: [
        500,
        539.0078,
        578.0858000000001,
        617,
        783.6999999999999,
        950.7,
        1117,
      ],
      unit: 'tonnes',
    });
  });
});
