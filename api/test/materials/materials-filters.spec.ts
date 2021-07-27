import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createLayer, createMaterial } from '../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { Layer } from '../../src/modules/layers/layer.entity';

describe('Materials - Filters', () => {
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

  test('When I fetch a material and I include its Layer relation in the query, then I should receive said material and its Layer relation', async () => {
    const layer: Layer = await createLayer();
    const material: Material = await createMaterial({ layerId: layer.id });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/materials/${material.id}?include=layer`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data.id).toEqual(material.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'layer',
    ]);
    expect(response.body.data.attributes.layer).toMatchObject(layer);
  });
});
