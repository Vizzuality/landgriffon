import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Layer } from 'modules/layers/layer.entity';
import { LayersModule } from 'modules/layers/layers.module';
import { LayerRepository } from 'modules/layers/layer.repository';

/**
 * Tests for the LayersModule.
 */

describe('LayersModule (e2e)', () => {
  let app: INestApplication;
  let layerRepository: LayerRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, LayersModule],
    }).compile();

    layerRepository = moduleFixture.get<LayerRepository>(LayerRepository);

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
    await layerRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Layers - Create', () => {
    test('Create a layer should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/layers')
        .send({
          text: 'test layer',
        })
        .expect(HttpStatus.CREATED);

      const createdLayer = await layerRepository.findOne(response.body.data.id);

      if (!createdLayer) {
        throw new Error('Error loading created Layer');
      }

      expect(createdLayer.text).toEqual('test layer');
    });
  });

  describe('Layers - Update', () => {
    test('Update a layer should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/layers/${layer.id}`)
        .send({
          text: 'updated test layer',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.text).toEqual('updated test layer');
    });
  });

  describe('Layers - Delete', () => {
    test('Delete a layer should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/layers/${layer.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await layerRepository.findOne(layer.id)).toBeUndefined();
    });
  });

  describe('Layers - Get all', () => {
    test('Get all layers should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/layers`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(layer.id);
    });
  });

  describe('Layers - Get by id', () => {
    test('Get a layer by id should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/layers/${layer.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(layer.id);
    });
  });
});
