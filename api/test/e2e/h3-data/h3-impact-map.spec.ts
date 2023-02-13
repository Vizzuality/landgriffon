import * as request from 'supertest';
import {
  createImpactMapMockData,
  ImpactMapMockData,
} from './mocks/h3-impact-map.mock';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { DataSource } from 'typeorm';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { RELATIVE_UNIT_MAP_RESPONSE } from 'modules/h3-data/h3-data-map.service';

/**
 * Tests for the h3 impact map.
 */

describe('H3 Data Module (e2e) - Impact map', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let impactMapMockData: ImpactMapMockData;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
    const indicatorRecordsService =
      testApplication.get<IndicatorRecordsService>(IndicatorRecordsService);

    ({ jwtToken } = await setupTestUser(testApplication));

    impactMapMockData = await createImpactMapMockData(dataSource);
    await indicatorRecordsService.updateImpactView();
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Missing required parameters', () => {
    test('When I get a calculated H3 Impact Map without any of the required parameters, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
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
      const response = await request(testApplication.getHttpServer())
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
      const response = await request(testApplication.getHttpServer())
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
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/impact`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        indicatorId: impactMapMockData.indicatorId,
        year: 2020,
        resolution: 6,
      });

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        { h: '861203a6fffffff', v: '500.00' },
        { h: '861203a5fffffff', v: '617.00' },
        { h: '861203a4fffffff', v: '1117.00' },
      ]),
    );
    expect(response.body.metadata.unit).toEqual('tonnes');
    expect(
      toBeCloseToArray(
        response.body.metadata.quantiles,
        [0, 539.0078, 578.0858, 617, 783.699999, 950.7, 1117],
        5,
      ),
    ).toBeTruthy();
  });

  describe('Zoom levels', () => {
    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 2)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 2,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([{ h: '821207fffffffff', v: '2234.00' }]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 2234, 2234, 2234, 2234, 2234, 2234],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 4)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 4,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([{ h: '841203bffffffff', v: '2234.00' }]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 2234, 2234, 2234, 2234, 2234, 2234],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map different zoom levels, then I should get the projected h3 data (zoom 6)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a6fffffff', v: '500.00' },
          { h: '861203a5fffffff', v: '617.00' },
          { h: '861203a4fffffff', v: '1117.00' },
        ]),
      );
      expect(response.body.metadata.unit).toEqual('tonnes');
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [0, 539.0078, 578.0858, 617, 783.699999, 950.7, 1117],
          5,
        ),
      ).toBeTruthy();
    });
  });

  describe('Optional query parameters', () => {
    test('When I get a calculated H3 Water Impact Map with the necessary input values and materials filter, then I should get the correct h3 data', async () => {
      const response = await request(testApplication.getHttpServer())
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
          { h: '861203a4fffffff', v: '617.00' },
          { h: '861203a5fffffff', v: '617.00' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
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
      const response = await request(testApplication.getHttpServer())
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
          { h: '861203a4fffffff', v: '617.00' },
          { h: '861203a5fffffff', v: '617.00' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (t1Supplier) filter, then I should get the correct h3 data', async () => {
      const response = await request(testApplication.getHttpServer())
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
          { h: '861203a4fffffff', v: '617.00' },
          { h: '861203a5fffffff', v: '617.00' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (producer) filter, then I should get the correct h3 data', async () => {
      const response = await request(testApplication.getHttpServer())
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
          { h: '861203a4fffffff', v: '617.00' },
          { h: '861203a5fffffff', v: '617.00' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and supplier (producer) filter, then I should get the correct h3 data', async () => {
      const response = await request(testApplication.getHttpServer())
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
          { h: '861203a4fffffff', v: '617.00' },
          { h: '861203a5fffffff', v: '617.00' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and Location Type filter, then I should get the correct h3 data', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT],
          year: 2020,
          resolution: 6,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '617.00' },
          { h: '861203a5fffffff', v: '617.00' },
        ]),
      );
      expect(response.body.metadata).toEqual({
        quantiles: [0, 617, 617, 617, 617, 617, 617],
        unit: 'tonnes',
      });
    });

    test('When I get a calculated H3 Water Impact Map with the necessary input values and Scenario Id property, then the response should include both actual data and Scenario data for the given id (ignoring INACTIVE interventions), and the quantiles should be calculated differently', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [
            LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
            LOCATION_TYPES.UNKNOWN,
          ],
          year: 2020,
          resolution: 6,
          scenarioId: impactMapMockData.scenarioId,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '1042.00' },
          { h: '861203a5fffffff', v: '592.00' },
          { h: '861203a6fffffff', v: '450.00' },
        ]),
      );
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.unit).toEqual('tonnes');
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [0, 497.3428, 544.7708, 592, 742.03, 892.329999, 1042],
          5,
        ),
      ).toBeTruthy();
    });
  });
  describe('Actual vs Scenario Comparison Map', () => {
    test('When I request a comparison map betwen actual H3 Water Impact Map data, and the data including a scenario with a given Id, then the response should have the difference between actual data and Scenario data (ignoring INACTIVE interventions)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [
            LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
            LOCATION_TYPES.UNKNOWN,
          ],
          year: 2020,
          resolution: 6,
          comparedScenarioId: impactMapMockData.scenarioId,
          relative: false,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '-75.00' },
          { h: '861203a5fffffff', v: '-25.00' },
          { h: '861203a6fffffff', v: '-50.00' },
        ]),
      );
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.unit).toEqual('tonnes');
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [-75, -58.3335, -41.6665, 0, 0, 0, 0],
          5,
        ),
      ).toBeTruthy();
    });

    test('When I request a comparison map betwen actual H3 Water Impact Map data, and the data including a scenario with a given Id with relative property set to true, then the response should have the difference between actual data and Scenario data in percentages (ignoring INACTIVE interventions)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [
            LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
            LOCATION_TYPES.UNKNOWN,
          ],
          year: 2020,
          resolution: 6,
          comparedScenarioId: impactMapMockData.scenarioId,
          relative: true,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '-7.33' },
          { h: '861203a5fffffff', v: '-2.07' },
          { h: '861203a6fffffff', v: '-5.26' },
        ]),
      );
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.unit).toEqual(RELATIVE_UNIT_MAP_RESPONSE);
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [-7.33, -5.95001, -4.196645, 0, 0, 0, 0],
          5,
        ),
      ).toBeTruthy();
    });
  });

  describe('Scenario vs Scenario Comparison Map', () => {
    test('When I request a comparison map between two scenarios (a baseScenario and a comparedScenario ids), then the response should have the difference between the data of of both scenarios (ignoring INACTIVE interventions)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [
            LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
            LOCATION_TYPES.UNKNOWN,
          ],
          year: 2020,
          resolution: 6,
          baseScenarioId: impactMapMockData.scenarioId,
          comparedScenarioId: impactMapMockData.scenarioTwoId,
          relative: false,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a7fffffff', v: '-150.00' },
          { h: '861203a6fffffff', v: '-50.00' },
          { h: '861203a5fffffff', v: '125.00' },
          { h: '861203a4fffffff', v: '75.00' },
        ]),
      );

      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.unit).toEqual('tonnes');
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [-150, -116.667, -83.333, 0, 91.6665, 108.3335, 125],
          5,
        ),
      ).toBeTruthy();
    });

    test('When I request a comparison map between two scenarios (a baseScenario and a comparedScenario ids) with relative property set to true, then the response should have the difference between the data of of both scenarios in percentages (ignoring INACTIVE interventions)', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'locationTypes[]': [
            LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
            LOCATION_TYPES.UNKNOWN,
          ],
          year: 2020,
          resolution: 6,
          baseScenarioId: impactMapMockData.scenarioId,
          comparedScenarioId: impactMapMockData.scenarioTwoId,
          relative: true,
        });

      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861203a4fffffff', v: '-6.54' },
          { h: '861203a5fffffff', v: '-11.80' },
          { h: '861203a6fffffff', v: '5.26' },
          { h: '861203a7fffffff', v: '200.00' },
        ]),
      );
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.unit).toEqual(RELATIVE_UNIT_MAP_RESPONSE);
      expect(
        toBeCloseToArray(
          response.body.metadata.quantiles,
          [-11.8, -10.04668, -8.293315, 0, 70.172684, 135.0873158, 200],
          5,
        ),
      ).toBeTruthy();
    });
  });

  describe('Active materials and indicator validations', () => {
    test('When I query impact map for inactive material, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'materialIds[]': [impactMapMockData.inactiveMaterialId],
          year: 2020,
          resolution: 6,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        'Following Requested Materials are not activated: Inactive Material',
      );
    });

    test('When I query impact map for inactive indicator, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.inactiveIndicatorId,
          'materialIds[]': [impactMapMockData.materialOneId],
          year: 2020,
          resolution: 6,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        'Requested Indicators are not activated: Inactive Indicator',
      );
    });

    test('When I query Actual vs Scenario comparison map for inactive material, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'materialIds[]': [impactMapMockData.inactiveMaterialId],
          year: 2020,
          resolution: 6,
          comparedScenarioId: impactMapMockData.scenarioId,
          relative: false,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        'Following Requested Materials are not activated: Inactive Material',
      );
    });

    test('When I query Actual vs Scenario comparison map for inactive indicator, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/actual/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.inactiveIndicatorId,
          'materialIds[]': [impactMapMockData.materialOneId],
          year: 2020,
          resolution: 6,
          comparedScenarioId: impactMapMockData.scenarioId,
          relative: false,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        'Requested Indicators are not activated: Inactive Indicator',
      );
    });

    test('When I query Scenario vs Scenario comparison map for inactive material, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.indicatorId,
          'materialIds[]': [impactMapMockData.inactiveMaterialId],
          year: 2020,
          resolution: 6,
          baseScenarioId: impactMapMockData.scenarioId,
          comparedScenarioId: impactMapMockData.scenarioTwoId,
          relative: false,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        'Following Requested Materials are not activated: Inactive Material',
      );
    });

    test('When I query Scenario vs Scenario comparison map for inactive indicator, then I should get a proper error message', async () => {
      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/h3/map/impact/compare/scenario/vs/scenario`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          indicatorId: impactMapMockData.inactiveIndicatorId,
          'materialIds[]': [impactMapMockData.materialOneId],
          year: 2020,
          resolution: 6,
          baseScenarioId: impactMapMockData.scenarioId,
          comparedScenarioId: impactMapMockData.scenarioTwoId,
          relative: false,
        });
      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        'Requested Indicators are not activated: Inactive Indicator',
      );
    });
  });
});

/**
 * Check that the numbers on all elements of the received array are close to the
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
