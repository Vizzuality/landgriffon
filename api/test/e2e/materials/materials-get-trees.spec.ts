import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Material } from 'modules/materials/material.entity';
import { MaterialRepository } from 'modules/materials/material.repository';
import {
  createH3Data,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
} from '../../entity-mocks';
import { expectedJSONAPIAttributes } from './config';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MATERIAL_TYPE } from 'modules/h3-data/entity-to-h3.entity';
import { MaterialsToH3sService } from 'modules/h3-data/materials-to-h3s.service';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

//TODO: Allow these tests when feature fix is merged
describe('Materials - Get trees', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let materialRepository: MaterialRepository;
  let materialToH3Service: MaterialsToH3sService;
  let h3dataRepository: H3DataRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
    materialToH3Service = testApplication.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    materialRepository =
      testApplication.get<MaterialRepository>(MaterialRepository);

    h3dataRepository = testApplication.get<H3DataRepository>(H3DataRepository);

    ({ jwtToken } = await setupTestUser(testApplication));

    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3dataRepository.delete({});
  });

  afterEach(async () => {
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3dataRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I request material trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toStrictEqual([]);
  });

  test('Get trees of materials should be successful (happy case)', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      name: 'root material',
    });
    await createMaterialToH3(
      rootMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childOneMaterial: Material = await createMaterial({
      name: 'leaf one material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      childOneMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childTwoMaterial: Material = await createMaterial({
      name: 'leaf two material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      childTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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

  test('Get trees of materials should filter out materials without producer or harvest data - leaf nodes', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      name: 'root material',
    });
    await createMaterialToH3(
      rootMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childOneMaterial: Material = await createMaterial({
      name: 'leaf one material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      childOneMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childTwoMaterial: Material = await createMaterial({
      name: 'leaf two material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      childTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.HARVEST,
    );
    await createMaterial({
      name: 'leaf three material',
      parent: rootMaterial,
    });

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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

  test('Get trees of materials should filter out materials without producer or harvest data - branch nodes', async () => {
    const h3Data: H3Data = await createH3Data();

    const rootMaterial: Material = await createMaterial({
      name: 'root material',
    });
    await createMaterialToH3(
      rootMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childOneMaterial: Material = await createMaterial({
      name: 'branch one material',
      parent: rootMaterial,
    });
    const childTwoMaterial: Material = await createMaterial({
      name: 'branch two material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      childTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.HARVEST,
    );
    const childThreeMaterial: Material = await createMaterial({
      name: 'leaf three material',
      parent: childOneMaterial,
    });
    await createMaterialToH3(
      childThreeMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.HARVEST,
    );

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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

    const rootOneMaterial: Material = await createMaterial({});
    await createMaterialToH3(
      rootOneMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const rootTwoMaterial: Material = await createMaterial({});
    await createMaterialToH3(
      rootTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childOneMaterial: Material = await createMaterial({
      parent: rootOneMaterial,
    });
    await createMaterialToH3(
      childOneMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const childTwoMaterial: Material = await createMaterial({
      parent: rootOneMaterial,
    });
    await createMaterialToH3(
      childTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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
      name: 'root material',
    });
    await createMaterialToH3(
      rootMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const branchOneMaterial: Material = await createMaterial({
      name: 'branch one material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      branchOneMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const branchTwoMaterial: Material = await createMaterial({
      name: 'branch two material',
      parent: rootMaterial,
    });
    await createMaterialToH3(
      branchTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const leafOneMaterial: Material = await createMaterial({
      name: 'leaf one material',
      parent: branchOneMaterial,
    });
    await createMaterialToH3(
      leafOneMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );
    const leafTwoMaterial: Material = await createMaterial({
      name: 'leaf two material',
      parent: branchTwoMaterial,
    });
    await createMaterialToH3(
      leafTwoMaterial.id,
      h3Data.id,
      MATERIAL_TYPE.PRODUCER,
    );

    const responseDepthZero = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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

    const responseDepthOne = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/materials/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
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

  test(
    'When I query a Impact Material Tree endpoint' +
      'Then I should receive a tree list of materials imported by a user' +
      'And if any of them is a child material, I should get its parent too',
    async () => {
      const h3Data: H3Data = await createH3Data();

      const parentMaterial: Material = await createMaterial({
        name: 'parentMaterial',
      });
      await createMaterialToH3(
        parentMaterial.id,
        h3Data.id,
        MATERIAL_TYPE.PRODUCER,
      );
      const childMaterial1: Material = await createMaterial({
        name: 'childMaterial',
        parent: parentMaterial,
      });
      await createMaterialToH3(
        childMaterial1.id,
        h3Data.id,
        MATERIAL_TYPE.PRODUCER,
      );
      const parentWithNoChildMaterial: Material = await createMaterial({
        name: 'parentWithNoChild',
      });
      await createMaterialToH3(
        parentWithNoChildMaterial.id,
        h3Data.id,
        MATERIAL_TYPE.PRODUCER,
      );

      const materialNotPresentInSourcingLocations: Material =
        await createMaterial({ name: 'materialNotPresentInSourcingLocations' });
      await createMaterialToH3(
        materialNotPresentInSourcingLocations.id,
        h3Data.id,
        MATERIAL_TYPE.PRODUCER,
      );

      for await (const material of [
        childMaterial1,
        parentWithNoChildMaterial,
      ]) {
        await createSourcingLocation({ materialId: material.id });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/materials/trees')
        .query({ withSourcingLocations: true })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[1].id).toEqual(parentWithNoChildMaterial.id);
      expect(response.body.data[1].attributes.children).toEqual([]);
      expect(response.body.data[0].id).toEqual(parentMaterial.id);
      expect(response.body.data[0].attributes.children[0].id).toEqual(
        childMaterial1.id,
      );
      expect(
        response.body.data.find(
          (material: Material) =>
            material.id === materialNotPresentInSourcingLocations.id,
        ),
      ).toBe(undefined);
    },
  );
});
