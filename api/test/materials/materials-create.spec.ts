import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Layer } from 'modules/layers/layer.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createLayer, createMaterial } from '../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import { expectedJSONAPIAttributes } from './config';

describe('Materials - Create', () => {
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

  test('Create a material should be successful (happy case)', async () => {
    const layer: Layer = await createLayer();

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
    expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
  });

  test('Create a material without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .send()
      .expect(HttpStatus.BAD_REQUEST);
    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'layerId must be a string',
        'layerId should not be empty',
        'name must be a string',
        'name must be longer than or equal to 2 characters',
        'name must be shorter than or equal to 300 characters',
        'name should not be empty',
      ],
    );
  });

  describe('Tree structure', () => {
    test('Create a material without a parent should be successful', async () => {
      const layer: Layer = await createLayer();

      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .send({
          name: 'test material',
          layerId: layer.id,
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
    });

    test('Create a material with a parent id that does not exist should fail with a 400 error', async () => {
      const layer: Layer = await createLayer();

      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .send({
          name: 'test material',
          layerId: layer.id,
          parentId: layer.id,
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        400,
        `Parent material with ID "${layer.id}" not found`,
      );
    });

    test('Create a material with a parent id that exists should be successful and return the associated parent id', async () => {
      const layer: Layer = await createLayer();
      const material: Material = await createMaterial();

      const response = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .send({
          name: 'test material',
          layerId: layer.id,
          parentId: material.id,
        })
        .expect(HttpStatus.CREATED);

      expect(response).toHaveJSONAPIAttributes(expectedJSONAPIAttributes);
      expect(response.body.data.attributes.parentId).toEqual(material.id);
    });
  });
});
