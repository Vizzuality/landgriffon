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
    await clearEntityTables([ContextualLayer]);
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
});
