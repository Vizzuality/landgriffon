import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createMaterial } from '../entity-mocks';
import { expectedJSONAPIAttributes } from './config';

//TODO: Allow these tests when feature fix is merged
describe('Materials - Get trees', () => {
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

  test('Get trees of materials should be successful (happy case)', async () => {
    const rootMaterial: Material = await createMaterial();
    const childOneMaterial: Material = await createMaterial({
      parent: rootMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      parent: rootMaterial,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toEqual(rootMaterial.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    expect(response.body.data[0].attributes.children).toHaveLength(2);
    expect(
      response.body.data[0].attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoMaterial.id, childOneMaterial.id].sort());
  });

  test('Get trees of materials should return multiple trees in parallel if they exist', async () => {
    const rootOneMaterial: Material = await createMaterial();
    const rootTwoMaterial: Material = await createMaterial();
    const childOneMaterial: Material = await createMaterial({
      parent: rootOneMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      parent: rootOneMaterial,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(2);
    expect(
      response.body.data.map((elem: Record<string, any>) => elem.id).sort(),
    ).toEqual([rootOneMaterial.id, rootTwoMaterial.id].sort());
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootOneMaterialFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootOneMaterial.id,
    );
    expect(rootOneMaterialFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootOneMaterialFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoMaterial.id, childOneMaterial.id].sort());
  });

  test('Get trees of materials filtered by depth should return trees up to the defined level of depth', async () => {
    const rootMaterial: Material = await createMaterial();
    const childOneMaterial: Material = await createMaterial({
      parent: rootMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      parent: rootMaterial,
    });
    await createMaterial({
      parent: childOneMaterial,
    });
    await createMaterial({
      parent: childTwoMaterial,
    });

    const responseDepthZero = await request(app.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .query({
        depth: 0,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseDepthZero.body.data).toHaveLength(1);
    expect(responseDepthZero.body.data[0].id).toEqual(rootMaterial.id);
    expect(responseDepthZero).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);
    expect(responseDepthZero.body.data[0].attributes.children).toEqual([]);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .query({
        depth: 1,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toEqual(rootMaterial.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootMaterialFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootMaterial.id,
    );
    expect(rootMaterialFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootMaterialFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoMaterial.id, childOneMaterial.id].sort());

    rootMaterialFromResponse.attributes.children.forEach(
      (childMaterial: Record<string, any>) => {
        expect(childMaterial.children).toEqual(undefined);
      },
    );
  });
});
