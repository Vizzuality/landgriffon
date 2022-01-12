import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { dropH3DataMock } from './mocks/h3-data.mock';
import {
  createImpactMapMockData,
  deleteImpactMapMockData,
  ImpactMapMockData,
} from './mocks/h3-impact-map.mock';

/**
 * Tests for the h3 impact map.
 */

describe('H3 Data Module (e2e) - Impact map', () => {
  let app: INestApplication;
  let impactMapMockData: ImpactMapMockData;

  const fakeTable = 'faketable';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    impactMapMockData = await createImpactMapMockData();
  });

  afterAll(async () => {
    await dropH3DataMock([fakeTable]);
    await deleteImpactMapMockData();
    await app.close();
  });

  describe('Missing required parameters', () => {
    test('When I get a calculated H3 Impact Map without any of the required parameters, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/v1/h3/map/impact`,
      );
      expect(response.body.errors[0].meta.rawError.response.message).toEqual([
        'indicatorId should not be empty',
        'indicatorId must be a string',
        'year should not be empty',
        'year must be a number conforming to the specified constraints',
        'Available resolutions: 1 to 6',
        'resolution must not be greater than 6',
        'resolution must not be less than 1',
        'resolution must be a number conforming to the specified constraints',
        'resolution should not be empty',
      ]);
    });

    test('When I get a calculated H3 Impact Map without a year value, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicators: impactMapMockData.indicatorId,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual([
        'property indicators should not exist',
        'indicatorId should not be empty',
        'indicatorId must be a string',
        'year should not be empty',
        'year must be a number conforming to the specified constraints',
        'Available resolutions: 1 to 6',
        'resolution must not be greater than 6',
        'resolution must not be less than 1',
        'resolution must be a number conforming to the specified constraints',
        'resolution should not be empty',
      ]);
    });

    test('When I get a calculated H3 Impact Map without a resolution value, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual([
        'Available resolutions: 1 to 6',
        'resolution must not be greater than 6',
        'resolution must not be less than 1',
        'resolution must be a number conforming to the specified constraints',
        'resolution should not be empty',
      ]);
    });
  });

  test('When I get a calculated H3 Water Impact Map with the necessary input values, then I should get the h3 data (happy case)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/impact`)
      .query({
        indicatorId: impactMapMockData.indicatorId,
        year: 2020,
        resolution: 6,
      });

    expect(response.body.data).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(response.body.metadata).toEqual({
      quantiles: [
        500, 539.0078, 578.0858000000001, 617, 783.6999999999999, 950.7, 1117,
      ],
      unit: 'tonnes',
      indicatorDataYear: 2020,
      materialsH3DataYears: [],
    });
  });

  describe('Zoom levels', () => {
    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 2)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 2,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            h: '821207fffffffff',
            v: 2234,
          },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [2234, 2234, 2234, 2234, 2234, 2234, 2234],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [],
      });
    });

    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 4)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 4,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            h: '841203bffffffff',
            v: 2234,
          },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [2234, 2234, 2234, 2234, 2234, 2234, 2234],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [],
      });
    });

    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 6)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
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
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [
          500, 539.0078, 578.0858000000001, 617, 783.6999999999999, 950.7, 1117,
        ],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [],
      });
    });
  });

  describe('Optional query parameters', () => {
    test('When I get a calculated H3 Water Impact Map with the necessary input values and materials filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'materialIds[]': [impactMapMockData.materialOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            h: '861203a4fffffff',
            v: 617,
          },
          {
            h: '861203a5fffffff',
            v: 617,
          },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [617, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [
          {
            materialDataType: 'harvest',
            materialDataYear: 2020,
            materialName: 'MaterialOne',
          },
          {
            materialDataType: 'producer',
            materialDataYear: 2020,
            materialName: 'MaterialOne',
          },
        ],
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and origins filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'originIds[]': [impactMapMockData.adminRegionOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            h: '861203a4fffffff',
            v: 617,
          },
          {
            h: '861203a5fffffff',
            v: 617,
          },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [617, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [],
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (t1Supplier) filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'supplierIds[]': [impactMapMockData.t1SupplierOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            h: '861203a4fffffff',
            v: 617,
          },
          {
            h: '861203a5fffffff',
            v: 617,
          },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [617, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [],
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (producer) filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'supplierIds[]': [impactMapMockData.producerOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          {
            h: '861203a4fffffff',
            v: 617,
          },
          {
            h: '861203a5fffffff',
            v: 617,
          },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [617, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
        indicatorDataYear: 2020,
        materialsH3DataYears: [],
      });
    });
  });
});
