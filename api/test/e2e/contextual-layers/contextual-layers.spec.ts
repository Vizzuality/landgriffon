import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { ContextualLayersModule } from 'modules/contextual-layers/contextual-layers.module';
import { clearEntityTables } from '../../utils/database-test-helper';
import {
  CONTEXTUAL_LAYER_CATEGORY,
  ContextualLayer,
  ContextualLayerByCategory,
} from 'modules/contextual-layers/contextual-layer.entity';
import { createContextualLayer } from '../../entity-mocks';
import { H3Data } from '../../../src/modules/h3-data/h3-data.entity';
import { dropH3DataMock, h3DataMock } from '../h3-data/mocks/h3-data.mock';
import { h3ContextualLayerExampleDataFixture } from '../h3-data/mocks/h3-fixtures';

/**
 * Tests for the GeoRegionsModule.
 */

describe('ContextualLayersModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ContextualLayersModule],
    }).compile();

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await clearEntityTables([H3Data, ContextualLayer]);
    await dropH3DataMock(['layerTable']);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Contextual Layers - Get all contextual layers by category', () => {
    test('When I query the API to get all the contextual layer info, Then I should get all available layers grouped by category', async () => {
      for (const num of [1, 2]) {
        await Promise.all(
          Object.values(CONTEXTUAL_LAYER_CATEGORY).map(
            async (category: string) => {
              return createContextualLayer({
                category: category as CONTEXTUAL_LAYER_CATEGORY,
              });
            },
          ),
        );
      }

      await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.DEFAULT,
      });
      const response = await request(app.getHttpServer())
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contextual-layers/${contextualLayer.id}/h3Data`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.errors[0].meta.rawError.response.message).toEqual(
        `No H3 Data could be found for contextual Layer with id ${contextualLayer.id}`,
      );
    });

    test(`When I query for H3 Data without resolution and year, I get proper h3 index data from the maximum resolution and most recent year available in the DB `, async () => {
      const contextualLayer: ContextualLayer = await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
      });

      const h3Data: H3Data = await h3DataMock({
        h3TableName: 'layerTable',
        h3ColumnName: 'layerColumn',
        additionalH3Data: h3ContextualLayerExampleDataFixture,
        year: 2020,
        contextualLayerId: contextualLayer.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contextual-layers/${contextualLayer.id}/h3Data`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveLength(4);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '861080007ffffff', v: 0.2 },
          { h: '86108002fffffff', v: 0.04 },
          { h: '8610b6d97ffffff', v: 0.1 },
          { h: '8610b6db7ffffff', v: null },
        ]),
      );
    });

    test(`When I query for H3 Data with a given resolution, I get proper H3 index data, grouped by H3 index for the requested resolution`, async () => {
      const contextualLayer: ContextualLayer = await createContextualLayer({
        category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
      });

      await h3DataMock({
        h3TableName: 'layerTable',
        h3ColumnName: 'layerColumn',
        additionalH3Data: h3ContextualLayerExampleDataFixture,
        year: 2020,
        contextualLayerId: contextualLayer.id,
      });

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/contextual-layers/${contextualLayer.id}/h3Data?resolution=2`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { h: '821087fffffffff', v: 0.24000001 },
          { h: '8210b7fffffffff', v: 0.1 },
        ]),
      );
    });
  });

  test.skip(`When I query for H3 Data with a given year, I get data from the closest year in the H3 data`, async () => {
    const contextualLayer: ContextualLayer = await createContextualLayer({
      category: CONTEXTUAL_LAYER_CATEGORY.BUSINESS_DATASETS,
    });

    await h3DataMock({
      h3TableName: 'layerTable',
      h3ColumnName: 'layerColumn',
      additionalH3Data: h3ContextualLayerExampleDataFixture,
      year: 2020,
      contextualLayerId: contextualLayer.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/contextual-layers/${contextualLayer.id}/h3Data?year=2010`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    /*
    //TODO To be properly implement after the July demo

    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveLength(4);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        { h: '861080007ffffff', v: 0.2 },
        { h: '86108002fffffff', v: 0.04 },
        { h: '8610b6d97ffffff', v: 0.1 },
        { h: '8610b6db7ffffff', v: null },
      ]),
    );
     */
  });
});
