import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import {
  createH3Data,
  createAdminRegion,
  createSourcingLocation,
} from '../../entity-mocks';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { expectedJSONAPIAttributes } from './config';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { Material } from 'modules/materials/material.entity';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

//TODO: Allow these tests when feature fix is merged
describe('AdminRegions - Get trees', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let adminRegionRepository: AdminRegionRepository;
  let h3dataRepository: H3DataRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    adminRegionRepository = testApplication.get<AdminRegionRepository>(
      AdminRegionRepository,
    );

    h3dataRepository = testApplication.get<H3DataRepository>(H3DataRepository);

    ({ jwtToken } = await setupTestUser(testApplication));
    await adminRegionRepository.delete({});
    await h3dataRepository.delete({});
  });

  afterEach(async () => {
    await adminRegionRepository.delete({});
    await h3dataRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I request admin regions trees, and the DB is empty, then I should get empty array', async () => {
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toStrictEqual([]);
  });

  test('Get trees of admin regions should be successful (happy case)', async () => {
    await createH3Data();

    const rootAdminRegion: AdminRegion = await createAdminRegion({
      name: 'root admin region',
    });
    const childOneAdminRegion: AdminRegion = await createAdminRegion({
      name: 'leaf one admin region',
      parent: rootAdminRegion,
    });
    const childTwoAdminRegion: AdminRegion = await createAdminRegion({
      name: 'leaf two admin region',
      parent: rootAdminRegion,
    });

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toEqual(rootAdminRegion.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    expect(response.body.data[0].attributes.children).toHaveLength(2);
    expect(
      response.body.data[0].attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoAdminRegion.id, childOneAdminRegion.id].sort());
  });

  test('Get trees of admin regions should return multiple trees in parallel if they exist', async () => {
    await createH3Data();

    const rootOneAdminRegion: AdminRegion = await createAdminRegion({});
    const rootTwoAdminRegion: AdminRegion = await createAdminRegion({});
    const childOneAdminRegion: AdminRegion = await createAdminRegion({
      parent: rootOneAdminRegion,
    });
    const childTwoAdminRegion: AdminRegion = await createAdminRegion({
      parent: rootOneAdminRegion,
    });

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(2);
    expect(
      response.body.data.map((elem: Record<string, any>) => elem.id).sort(),
    ).toEqual([rootOneAdminRegion.id, rootTwoAdminRegion.id].sort());
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootOneAdminRegionFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootOneAdminRegion.id,
    );
    expect(rootOneAdminRegionFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootOneAdminRegionFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([childTwoAdminRegion.id, childOneAdminRegion.id].sort());
  });

  test('Get trees of admin regions filtered by depth should return trees up to the defined level of depth', async () => {
    await createH3Data();

    const rootAdminRegion: AdminRegion = await createAdminRegion({
      name: 'root admin region',
    });
    const branchOneAdminRegion: AdminRegion = await createAdminRegion({
      name: 'branch one admin region',
      parent: rootAdminRegion,
    });
    const branchTwoAdminRegion: AdminRegion = await createAdminRegion({
      name: 'branch two admin region',
      parent: rootAdminRegion,
    });
    await createAdminRegion({
      name: 'leaf one admin region',
      parent: branchOneAdminRegion,
    });
    await createAdminRegion({
      name: 'leaf two admin region',
      parent: branchTwoAdminRegion,
    });

    const responseDepthZero = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        depth: 0,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseDepthZero.body.data).toHaveLength(1);
    expect(responseDepthZero.body.data[0].id).toEqual(rootAdminRegion.id);
    expect(responseDepthZero).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const responseDepthOne = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        depth: 1,
      })
      .send()
      .expect(HttpStatus.OK);

    expect(responseDepthOne.body.data).toHaveLength(1);
    expect(responseDepthOne.body.data[0].id).toEqual(rootAdminRegion.id);
    expect(responseDepthOne).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootAdminRegionFromResponseDepthOne = responseDepthOne.body.data.find(
      (elem: Record<string, any>) => elem.id === rootAdminRegion.id,
    );
    expect(
      rootAdminRegionFromResponseDepthOne.attributes.children,
    ).toHaveLength(2);
    expect(
      rootAdminRegionFromResponseDepthOne.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([branchTwoAdminRegion.id, branchOneAdminRegion.id].sort());

    rootAdminRegionFromResponseDepthOne.attributes.children.forEach(
      (childAdminRegion: Record<string, any>) => {
        expect(childAdminRegion.children).toEqual([]);
      },
    );

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/trees`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toEqual(rootAdminRegion.id);
    expect(response).toHaveJSONAPIAttributes([
      ...expectedJSONAPIAttributes,
      'children',
    ]);

    const rootAdminRegionFromResponse = response.body.data.find(
      (elem: Record<string, any>) => elem.id === rootAdminRegion.id,
    );
    expect(rootAdminRegionFromResponse.attributes.children).toHaveLength(2);
    expect(
      rootAdminRegionFromResponse.attributes.children
        .map((elem: Record<string, any>) => elem.id)
        .sort(),
    ).toEqual([branchTwoAdminRegion.id, branchOneAdminRegion.id].sort());

    rootAdminRegionFromResponse.attributes.children.forEach(
      (childAdminRegion: Record<string, any>) => {
        expect(childAdminRegion.children).toBeInstanceOf(Array);
        expect(childAdminRegion.children).toHaveLength(1);
      },
    );
  });
  test(
    'When I query a Impact Admin-Region Tree endpoint' +
      'Then I should receive a tree list of admin imported where sourcing locations of the user are' +
      'And if any of them is a child admin-region, I should get its parent too',
    async () => {
      const parentAdminRegion: AdminRegion = await createAdminRegion({
        name: 'parentAdminRegion',
      });
      const childAdminRegion: AdminRegion = await createAdminRegion({
        name: 'childAdminRegion',
        parent: parentAdminRegion,
      });

      const parentWithNoChildAdminRegion: AdminRegion = await createAdminRegion(
        {
          name: 'parentWithNoChild',
        },
      );
      const adminRegionNotPresentInSourcingLocations: AdminRegion =
        await createAdminRegion({
          name: 'adminRegionNotPresentInSourcingLocations',
        });

      for await (const adminRegion of [
        childAdminRegion,
        parentWithNoChildAdminRegion,
      ]) {
        await createSourcingLocation({ adminRegionId: adminRegion.id });
      }

      const response = await request(testApplication.getHttpServer())
        .get('/api/v1/admin-regions/trees')
        .query({ withSourcingLocations: true })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(HttpStatus.OK);
      expect(response.body.data[1].id).toEqual(parentWithNoChildAdminRegion.id);
      expect(response.body.data[1].attributes.children).toEqual([]);
      expect(response.body.data[0].id).toEqual(parentAdminRegion.id);
      expect(response.body.data[0].attributes.children[0].id).toEqual(
        childAdminRegion.id,
      );
      expect(
        response.body.data.find(
          (material: Material) =>
            material.id === adminRegionNotPresentInSourcingLocations.id,
        ),
      ).toBe(undefined);
    },
  );
  test('When I want to get regions given a country, but the admin-region received is not a country, then I should see an error', async () => {
    const notACountry: AdminRegion = await createAdminRegion({
      level: 1,
      name: 'not a country',
    });

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/${notACountry.id}/regions`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.body.errors[0].title).toEqual(
      `Admin region with ID "${notACountry.id}" not found`,
    );
  });
  test('When I want to get regions given a country, I should receive the regions that are within said country', async () => {
    const country1: AdminRegion = await createAdminRegion({
      name: 'country1',
      level: 0,
    });
    const country2: AdminRegion = await createAdminRegion({
      name: 'country2',
      level: 0,
    });
    const region1: AdminRegion = await createAdminRegion({
      name: 'region1',
      parent: country1,
    });
    await createAdminRegion({
      name: 'regionw',
      parent: country1,
    });
    const subregion1 = await createAdminRegion({
      name: 'subregion1',
      parent: region1,
    });
    await createAdminRegion({
      name: 'subregion2',
      parent: country2,
    });

    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/admin-regions/${country1.id}/regions`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.body.data[0].id).toEqual(country1.id);
    expect(response.body.data[0].attributes.children).toHaveLength(2);
    expect(response.body.data[0].attributes.children[0].id).toEqual(region1.id);
    expect(response.body.data[0].attributes.children[0].children).toHaveLength(
      1,
    );
    expect(response.body.data[0].attributes.children[0].children[0].id).toEqual(
      subregion1.id,
    );
  });
});
