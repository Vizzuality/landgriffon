import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { dropH3DataMock } from './mocks/h3-data.mock';
import {
  createImpactMapMockData,
  deleteImpactMapMockData,
  ImpactMapMockData,
} from './mocks/h3-impact-map.mock';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { LOCATION_TYPES_PARAMS } from 'modules/sourcing-locations/sourcing-location.entity';

import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';

/**
 * Tests for the h3 impact map.
 */

describe('H3 Data Module (e2e) - Impact map', () => {
  let app: INestApplication;
  let impactMapMockData: ImpactMapMockData;
  let jwtToken: string;

  const fakeTable = 'faketable';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);

    impactMapMockData = await createImpactMapMockData();
    await IndicatorRecord.updateImpactView();
  });

  afterAll(async () => {
    await dropH3DataMock([fakeTable]);
    await deleteImpactMapMockData();
    await app.close();
  });

  describe('Missing required parameters', () => {
    test('When I get a calculated H3 Impact Map without any of the required parameters, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`);
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
        .set('Authorization', `Bearer ${jwtToken}`)
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
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: impactMapMockData.indicatorId,
        year: 2020,
        resolution: 6,
      });

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        { h: '861203a6fffffff', v: '100.00' },
        { h: '861203a5fffffff', v: '123.40' },
        { h: '861203a4fffffff', v: '223.40' },
      ]),
    );
    expect(response.body.metadata).toEqual({
      quantiles: [0, +107.80156, +115.61716, +123.4, +156.74, +190.14, +223.4],
      unit: 'tonnes',
      indicatorDataYear: 2020,
    });
  });

  describe('Zoom levels', () => {
    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 2)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 2,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([{ h: '821207fffffffff', v: '446.80' }]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, +446.8, +446.8, +446.8, +446.8, +446.8, +446.8],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 4)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 4,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([{ h: '841203bffffffff', v: '446.80' }]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 446.8, 446.8, 446.8, 446.8, 446.8, 446.8],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 6)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a6fffffff', v: '100.00' },
          { h: '861203a5fffffff', v: '123.40' },
          { h: '861203a4fffffff', v: '223.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [
          0, +107.80156, +115.61716, +123.4, +156.74, +190.14, +223.4,
        ],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });
  });

  describe('Optional query parameters', () => {
    test('When I get a calculated H3 Water Impact Map with the necessary input values and materials filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'materialIds[]': [impactMapMockData.materialOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '123.40' },
          { h: '861203a5fffffff', v: '123.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, +123.4, +123.4, +123.4, +123.4, +123.4, +123.4],
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
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'originIds[]': [impactMapMockData.adminRegionOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '123.40' },
          { h: '861203a5fffffff', v: '123.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, +123.4, +123.4, +123.4, +123.4, +123.4, +123.4],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (t1Supplier) filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'supplierIds[]': [impactMapMockData.t1SupplierOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '123.40' },
          { h: '861203a5fffffff', v: '123.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, +123.4, +123.4, +123.4, +123.4, +123.4, +123.4],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (producer) filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'supplierIds[]': [impactMapMockData.producerOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '123.40' },
          { h: '861203a5fffffff', v: '123.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, +123.4, +123.4, +123.4, +123.4, +123.4, +123.4],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (producer) filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'supplierIds[]': [impactMapMockData.producerOneId],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '123.40' },
          { h: '861203a5fffffff', v: '123.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [
          0,
          +'123.40',
          +'123.40',
          +'123.40',
          +'123.40',
          +'123.40',
          +'123.40',
        ],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and Location Type filter, then I should get the correct h3 data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [LOCATION_TYPES_PARAMS.AGGREGATION_POINT],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '123.40' },
          { h: '861203a5fffffff', v: '123.40' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, +123.4, +123.4, +123.4, +123.4, +123.4, +123.4],
        unit: 'tonnes',
        indicatorDataYear: 2020,
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and Scenario Id property, then the response should include both actual data and Scenario data for the given id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [
            LOCATION_TYPES_PARAMS.AGGREGATION_POINT,
            LOCATION_TYPES_PARAMS.UNKNOWN,
          ],
          year: 2020,
          resolution: 6,
          scenarioId: impactMapMockData.scenarioId,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '208.40' },
          { h: '861203a5fffffff', v: '118.40' },
          { h: '861203a6fffffff', v: '90.00' },
        ]),
      );
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.unit).toEqual('tonnes');
      expect(response.body.metadata.indicatorDataYear).toEqual(2020);
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [0, 99.46856, 108.95416, 118.4, 148.406, 178.466, 208.4],
          5,
        ),
      ).toBeTruthy();
    });
  });
});

/**
 * Check that the numbers on all elements of the received array are close to to the
 * corresponding elements of the expected array
 * @param receivedNumbers
 * @param expectedNumbers
 * @param numDigits
 */
function toBeCloseToArray(
  receivedNumbers: number[],
  expectedNumbers: number[],
  numDigits?: number,
): boolean {
  if (receivedNumbers.length !== expectedNumbers.length) {
    throw new Error(
      `Received: ${receivedNumbers}. Expected: ${expectedNumbers}`,
    );
  }

  for (let i = 0; i < receivedNumbers.length; i++) {
    expect(receivedNumbers[i]).toBeCloseTo(expectedNumbers[i], numDigits);
  }

  return true;
}
