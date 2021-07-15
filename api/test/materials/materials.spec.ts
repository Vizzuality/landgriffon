import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Layer } from 'modules/layers/layer.entity';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';

/**
 * Tests for the MaterialsModule.
 */

describe('MaterialsModule (e2e)', () => {
  let app: INestApplication;
  let materialRepository: MaterialRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    materialRepository = moduleFixture.get<MaterialRepository>(
      MaterialRepository,
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
    await materialRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Materials - Create', () => {
    test('Create a material should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .send({
          name: 'test material',
          layerId: layer.id,
        })
        .expect(HttpStatus.CREATED);

      const createdMaterial = await materialRepository.findOne(
        response.body.data.id,
      );

      if (!createdMaterial) {
        throw new Error('Error loading created Material');
      }

      expect(createdMaterial.name).toEqual('test material');
    });

    test('Create a material without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(HttpStatus.BAD_REQUEST, [
        'name must be a string',
        'name must be longer than or equal to 2 characters',
        'name must be shorter than or equal to 40 characters',
        'name should not be empty',
      ]);
    });
  });

  describe('Materials - Update', () => {
    test('Update a material should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const material: Material = new Material();
      material.name = 'test material';
      material.layerId = layer.id;
      await material.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/materials/${material.id}`)
        .send({
          name: 'updated test material',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual(
        'updated test material',
      );
    });
  });

  describe('Materials - Delete', () => {
    test('Delete a material should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const material: Material = new Material();
      material.name = 'test material';
      material.layerId = layer.id;
      await material.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/materials/${material.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await materialRepository.findOne(material.id)).toBeUndefined();
    });
  });

  describe('Materials - Get all', () => {
    test('Get all materials should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const material: Material = new Material();
      material.name = 'test material';
      material.layerId = layer.id;
      await material.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/materials`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(material.id);
    });
  });

  describe('Materials - Get by id', () => {
    test('Get a material by id should be successful (happy case)', async () => {
      const layer: Layer = new Layer();
      layer.text = 'test layer';
      await layer.save();

      const material: Material = new Material();
      material.name = 'test material';
      material.layerId = layer.id;
      await material.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/materials/${material.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(material.id);
    });
  });
});
