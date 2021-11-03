import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Material } from 'modules/materials/material.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { MaterialRepository } from 'modules/materials/material.repository';
import { createH3Data, createMaterial } from '../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';

//TODO: Allow these tests when feature fix is merged
describe('Materials - Get trees', () => {
  let app: INestApplication;
  let materialRepository: MaterialRepository;
  let h3dataRepository: H3DataRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MaterialsModule],
    }).compile();

    materialRepository = moduleFixture.get<MaterialRepository>(
      MaterialRepository,
    );

    h3dataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    await materialRepository.delete({});
    await h3dataRepository.delete({});
  });

  afterEach(async () => {
    await materialRepository.delete({});
    await h3dataRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('Get trees of materials should be successful (happy case)', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      name: 'root material',
      producerId: h3Data.id,
    });
    const childOneMaterial: Material = await createMaterial({
      name: 'leaf one material',
      producerId: h3Data.id,
      parent: rootMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      name: 'leaf two material',
      producerId: h3Data.id,
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

  test('Get trees of materials should filter out materials without producerId or harvestId - leaf nodes', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      name: 'root material',
      producerId: h3Data.id,
    });
    const childOneMaterial: Material = await createMaterial({
      name: 'leaf one material',
      producerId: h3Data.id,
      parent: rootMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      name: 'leaf two material',
      harvestId: h3Data.id,
      parent: rootMaterial,
    });
    const childThreeMaterial: Material = await createMaterial({
      name: 'leaf three material',
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

  test('Get trees of materials should filter out materials without producerId or harvestId - branch nodes', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      name: 'root material',
      producerId: h3Data.id,
    });
    const childOneMaterial: Material = await createMaterial({
      name: 'branch one material',
      parent: rootMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      name: 'branch two material',
      harvestId: h3Data.id,
      parent: rootMaterial,
    });
    const childThreeMaterial: Material = await createMaterial({
      name: 'leaf three material',
      harvestId: h3Data.id,
      parent: childOneMaterial,
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
    ).toEqual([childTwoMaterial.id, childThreeMaterial.id].sort());
  });

  test('Get trees of materials should return multiple trees in parallel if they exist', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootOneMaterial: Material = await createMaterial({
      producerId: h3Data.id,
    });
    const rootTwoMaterial: Material = await createMaterial({
      producerId: h3Data.id,
    });
    const childOneMaterial: Material = await createMaterial({
      producerId: h3Data.id,
      parent: rootOneMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      producerId: h3Data.id,
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
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      producerId: h3Data.id,
      name: 'root material',
    });
    const branchOneMaterial: Material = await createMaterial({
      producerId: h3Data.id,
      name: 'branch one material',
      parent: rootMaterial,
    });
    const branchTwoMaterial: Material = await createMaterial({
      producerId: h3Data.id,
      name: 'branch two material',
      parent: rootMaterial,
    });
    await createMaterial({
      producerId: h3Data.id,
      name: 'leaf one material',
      parent: branchOneMaterial,
    });
    await createMaterial({
      producerId: h3Data.id,
      name: 'leaf two material',
      parent: branchTwoMaterial,
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

    const responseDepthOne = await request(app.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .query({
        depth: 1,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseDepthOne.body.data).toHaveLength(1);
    expect(responseDepthOne.body.data[0].id).toEqual(rootMaterial.id);
    expect(responseDepthOne).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootMaterialFromResponseDepthOne = responseDepthOne.body.data.find(
      (elem: Record<string, any>) => elem.id === rootMaterial.id,
    );
    expect(rootMaterialFromResponseDepthOne.attributes.children).toHaveLength(
      2,
    );
    expect(
      rootMaterialFromResponseDepthOne.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([branchTwoMaterial.id, branchOneMaterial.id].sort());

    rootMaterialFromResponseDepthOne.attributes.children.forEach(
      (childMaterial: Record<string, any>) => {
        expect(childMaterial.children).toEqual([]);
      },
    );

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

    const rootMaterialFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootMaterial.id,
    );
    expect(rootMaterialFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootMaterialFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([branchTwoMaterial.id, branchOneMaterial.id].sort());

    rootMaterialFromResponse.attributes.children.forEach(
      (childMaterial: Record<string, any>) => {
        expect(childMaterial.children).toBeInstanceOf(Array);
        expect(childMaterial.children).toHaveLength(1);
      },
    );
  });
});
