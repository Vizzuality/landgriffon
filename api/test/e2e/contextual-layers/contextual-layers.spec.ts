import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import {
  CONTEXTUAL_LAYER_AGG_TYPE,
  CONTEXTUAL_LAYER_CATEGORY,
  ContextualLayer,
  ContextualLayerByCategory,
} from 'modules/contextual-layers/contextual-layer.entity';
import { createContextualLayer } from '../../entity-mocks';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { dropH3DataMock, h3DataMock } from '../h3-data/mocks/h3-data.mock';
import { h3ContextualLayerExampleDataFixture } from '../h3-data/mocks/h3-fixtures';
import { DataSource } from 'typeorm';

/**
 * Tests for the GeoRegionsModule.
 */

describe('ContextualLayersModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [H3Data, ContextualLayer]);
    const layerTables: string[] = Object.values(CONTEXTUAL_LAYER_AGG_TYPE).map(
      (value: CONTEXTUAL_LAYER_AGG_TYPE) => 'layerTable' + value,
    );
    await dropH3DataMock(dataSource, ['layerTable', ...layerTables]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Contextual Layers - Get all contextual layers by category', () => {
    test('When I query the API to get all the contextual layer info, Then I should get all available layers grouped by category', async () => {
      await Promise.all(
        Array.from(Array(2)).map(() => {
          return Promise.all(
            Object.values(CONTEXTUAL_LAYER_CATEGORY).map(
              async (category: string) => {
                return createContextualLayer({
                  category: category as CONTEXTUAL_LAYER_CATEGORY,
                });
              },
            ),
          );
        }),
      );

      await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.DEFAULT,
      });
      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/contextual-layers/categories')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);

      Object.values(CONTEXTUAL_LAYER_CATEGORY).forEach((value: string) =>
        expect(
          response.body.data.find(
            (layer: ContextualLayerByCategory) => layer.category === value,
          ),
        ),
      );

      expect(
        response.body.data.filter(
          (category: ContextualLayerByCategory) =>
            category.category === CONTEXTUAL_LAYER_CATEGORY.DEFAULT,
        )[0].layers,
      ).toHaveLength(3);
    });
  });

  describe('Get all H3 Data for Contextual Layer', () => {
    test(`When I query for H3 Data, and the contextual layer doesn't have any H3Data associated it should return error`, async () => {
      const contextualLayer: ContextualLayer = await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
      });

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/contextual-layers/${contextualLayer.id}/h3Data`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        `No H3 Data could be found for contextual Layer with id ${contextualLayer.id}`,
      );
    });

    test(`When I query for H3 Data with a given resolution, and the layer's metadata doesn't have the property "aggType", it will return error`, async () => {
      const contextualLayer: ContextualLayer = await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
        metadata: { test: 'no aggType' } as unknown as JSON,
      });

      await h3DataMock(dataSource, {
        h3TableName: 'layerTable',
        h3ColumnName: 'layerColumn',
        additionalH3Data: h3ContextualLayerExampleDataFixture,
        year: 2020,
        contextualLayerId: contextualLayer.id,
      });

      const response = await request(testApplication.getHttpServer())
        .get(
          `/api/v1/contextual-layers/${contextualLayer.id}/h3Data?resolution=2`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        `No aggregation type on metadata of Contextual layer Id: ${contextualLayer.id}`,
      );
    });

    test(`When I query for H3 Data without resolution and year, I get proper h3 index data from the maximum resolution and most recent year available in the DB`, async () => {
      const contextualLayer: ContextualLayer = await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
        metadata: { test: 'metadata' } as unknown as JSON,
      });

      await h3DataMock(dataSource, {
        h3TableName: 'layerTable',
        h3ColumnName: 'layerColumn',
        additionalH3Data: h3ContextualLayerExampleDataFixture,
        year: 2020,
        contextualLayerId: contextualLayer.id,
      });

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/contextual-layers/${contextualLayer.id}/h3Data`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861080007ffffff', v: 0.2 },
          { h: '86108002fffffff', v: 0.04 },
          { h: '86108001fffffff', v: 0.2 },
          { h: '861080027ffffff', v: 1 },
          { h: '861080017ffffff', v: 0.5 },
          { h: '8610b6d97ffffff', v: 0.5 },
          { h: '8610b6db7ffffff', v: null },
          { h: '8610b6d9fffffff', v: 5 },
          { h: '8610b6da7ffffff', v: 0.5 },
          { h: '8610b6dafffffff', v: 0 },
        ]),
      );
      expect(response.body.metadata).toEqual({ test: 'metadata' });
    });

    test(`When I query for H3 Data with a given resolution but without year, I get proper H3 index data, aggregated by H3 index according to the type on the layer's metadata, for the requested resolution, for the most recent year available`, async () => {
      const layers: Map<CONTEXTUAL_LAYER_AGG_TYPE, ContextualLayer> = new Map();
      for (const aggType of Object.values(CONTEXTUAL_LAYER_AGG_TYPE)) {
        const layer: ContextualLayer = await createContextualLayer({
          category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
          metadata: {
            aggType: aggType,
          } as unknown as JSON,
        });

        layers.set(aggType, layer);

        await h3DataMock(dataSource, {
          h3TableName: 'layerTable' + aggType,
          h3ColumnName: 'layerColumn',
          additionalH3Data: h3ContextualLayerExampleDataFixture,
          year: 2020,
          contextualLayerId: layer.id,
        });
      }

      const responses: Map<CONTEXTUAL_LAYER_AGG_TYPE, request.Response> =
        new Map();
      for (const layer of layers.entries()) {
        const response = await request(testApplication.getHttpServer())
          .get(`/api/v1/contextual-layers/${layer[1].id}/h3Data?resolution=2`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        responses.set(layer[0], response);
      }

      for (const type of Object.values(CONTEXTUAL_LAYER_AGG_TYPE)) {
        let values;
        switch (type) {
          case CONTEXTUAL_LAYER_AGG_TYPE.SUM:
            values = [
              { h: '821087fffffffff', v: 1.94 },
              { h: '8210b7fffffffff', v: 6 },
            ];
            break;
          case CONTEXTUAL_LAYER_AGG_TYPE.MAX:
            values = [
              { h: '821087fffffffff', v: 1 },
              { h: '8210b7fffffffff', v: 5 },
            ];
            break;
          case CONTEXTUAL_LAYER_AGG_TYPE.MIN:
            values = [
              { h: '821087fffffffff', v: 0.04 },
              { h: '8210b7fffffffff', v: 0 },
            ];
            break;
          case CONTEXTUAL_LAYER_AGG_TYPE.MEAN:
            values = [
              { h: '821087fffffffff', v: 0.388000001013279 },
              { h: '8210b7fffffffff', v: 1.5 },
            ];
            break;
          case CONTEXTUAL_LAYER_AGG_TYPE.MEDIAN:
            // https://towardsdatascience.com/how-to-derive-summary-statistics-using-postgresql-742f3cdc0f44
            values = [
              { h: '821087fffffffff', v: 0.2 },
              { h: '8210b7fffffffff', v: 0.5 },
            ];
            break;
          case CONTEXTUAL_LAYER_AGG_TYPE.MODE:
            values = [
              { h: '821087fffffffff', v: 0.2 },
              { h: '8210b7fffffffff', v: 0.5 },
            ];
            break;
          default:
            values = [
              { h: '821087fffffffff', v: 1.94 },
              { h: '8210b7fffffffff', v: 6 },
            ];
            break;
        }

        const response = responses.get(type);
        expect(response?.body.data).toBeDefined();
        expect(response?.body.data).toHaveLength(2);
        expect(response?.body.data).toEqual(expect.arrayContaining(values));
      }
    });

    //TODO the closest year functionality is not implemented nor considered for the July demo
    // it should be done and the tests changed accordingly after that
    test.skip(`When I query for H3 Data with year but without resolution, I get proper h3 index data from the maximum resolution and closest year available in the DB `, async () => {
      const contextualLayer: ContextualLayer = await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
        metadata: { test: 'metadata' } as unknown as JSON,
      });

      await h3DataMock(dataSource, {
        h3TableName: 'layerTable',
        h3ColumnName: 'layerColumn',
        additionalH3Data: h3ContextualLayerExampleDataFixture,
        year: 2020,
        contextualLayerId: contextualLayer.id,
      });

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/contextual-layers/${contextualLayer.id}/h3Data?year=2019`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861080007ffffff', v: 0.2 },
          { h: '86108002fffffff', v: 0.04 },
          { h: '86108001fffffff', v: 0.2 },
          { h: '861080027ffffff', v: 1 },
          { h: '861080017ffffff', v: 0.5 },
          { h: '8610b6d97ffffff', v: 0.5 },
          { h: '8610b6db7ffffff', v: null },
          { h: '8610b6d9fffffff', v: 5 },
          { h: '8610b6da7ffffff', v: 0.5 },
          { h: '8610b6dafffffff', v: 0 },
        ]),
      );
      expect(response.body.metadata).toEqual({ test: 'metadata' });
    });

    //TODO the closest year functionality is not implemented nor considered for the July demo
    // it should be done and the tests changed accordingly after that
    test.skip(`When I query for H3 Data with a given resolution and year, I get proper H3 index data, grouped by H3 index for the requested resolution and closest year`, async () => {
      console.log('To be implemented');
    });
  });
});
