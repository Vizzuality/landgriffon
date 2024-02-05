import * as request from 'supertest';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { dropH3DataMock, h3DataMock } from './mocks/h3-data.mock';
import { createMaterial, createMaterialToH3 } from '../../entity-mocks';
import { MaterialRepository } from 'modules/materials/material.repository';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { h3MaterialExampleDataFixture } from './mocks/h3-fixtures';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { DataSource } from 'typeorm';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import {
  Material,
  MATERIALS_STATUS,
} from '../../../src/modules/materials/material.entity';

/**
 * Tests for the H3DataModule.
 */

describe('H3 Data Module (e2e) - Material map', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  let materialToH3Service: MaterialsToH3sService;
  const FAKE_UUID = '959dc56e-a782-441a-be36-1aaa617ed843';
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    materialToH3Service = testApplication.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    h3DataRepository = testApplication.get<H3DataRepository>(H3DataRepository);
    materialRepository =
      testApplication.get<MaterialRepository>(MaterialRepository);

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await dropH3DataMock(dataSource, [fakeTable]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When I query a material H3 with a non available resolution, then I should get a proper error message', async () => {
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/material?materialId=${FAKE_UUID}&resolution=0`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'Available resolutions: 1 to 6',
    );
  });

  test('When I query a material H3 data with a resolution value that is not a number, then I should get a proper error message', async () => {
    const response = await request(testApplication.getHttpServer())
      .get(
        `/api/v1/h3/map/material?materialId=${FAKE_UUID}&resolution=definitelyNotANumber`,
      )
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(response.body.errors[0].meta.rawError.response.message[1]).toEqual(
      'resolution must be a number conforming to the specified constraints',
    );
  });

  test('When I query inactive material H3 data, then I should get a proper error message', async () => {
    const material: Material = await createMaterial({
      status: MATERIALS_STATUS.INACTIVE,
      name: 'Inactive Material',
    });
    const response = await request(testApplication.getHttpServer())
      .get(
        `/api/v1/h3/map/material?materialId=${material.id}&resolution=6&year=2020`,
      )
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(response.body.errors[0].meta.rawError.response.message).toEqual(
      'Following Requested Materials are not activated: Inactive Material',
    );
  });

  test('When I query a material H3 data but it has no year value, then I should get a proper error message', async () => {
    const material = await createMaterial({ name: 'Material with no H3' });
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/material`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        materialId: material.id,
        resolution: 1,
      });

    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'year should not be empty',
      'year must be a number conforming to the specified constraints',
    ]);
  });

  test('When I query a material H3 data but it has no H3 data available, then I should get a proper error message', async () => {
    const material = await createMaterial({ name: 'Material with no H3' });
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/material`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        materialId: material.id,
        resolution: 1,
        year: 2020,
      });

    expect(response.body.errors[0].title).toEqual(
      `There is no H3 Data for Material with ID: ${material.id}`,
    );
  });

  test('When I query a material H3 data with no resolution provided, then I should get a proper error message', async () => {
    const material = await createMaterial();
    const response = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/material?materialId=${material.id}`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(response.body.errors[0].meta.rawError.response.message[2]).toEqual(
      'resolution should not be empty',
    );
  });

  test('When I query same H3 data at different resolutions I expect 4 indexes at resolution 1 and 7 indexes at resolution 3, 0 and null values ignored', async () => {
    const h3Data = await h3DataMock(dataSource, {
      h3TableName: fakeTable,
      h3ColumnName: fakeColumn,
      additionalH3Data: h3MaterialExampleDataFixture,
      year: 2020,
    });
    const material = await createMaterial();
    await createMaterialToH3(
      material.id,
      h3Data.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    const responseRes1 = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/material`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        materialId: material.id,
        resolution: 1,
        year: 2020,
      });

    const responseRes3 = await request(testApplication.getHttpServer())
      .get(`/api/v1/h3/map/material`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        materialId: material.id,
        resolution: 3,
        year: 2020,
      });

    expect(responseRes1.body.data).toEqual(
      expect.arrayContaining([
        { h: '8110bffffffffff', v: 1610 },
        { h: '81743ffffffffff', v: 825 },
        { h: '818c3ffffffffff', v: 430 },
        { h: '812cbffffffffff', v: 800 },
      ]),
    );

    expect(responseRes1.body.metadata).toEqual({
      quantiles: [0, 2.4, 10, 40, 100, 500, 2000],
      unit: 'tonnes',
    });

    expect(responseRes3.body.data).toEqual(
      expect.arrayContaining([
        { h: '831080fffffffff', v: 860 },
        { h: '8310b6fffffffff', v: 750 },
        { h: '837400fffffffff', v: 735 },
        { h: '837436fffffffff', v: 90 },
        { h: '838c00fffffffff', v: 230 },
        { h: '838c36fffffffff', v: 200 },
        { h: '832c80fffffffff', v: 800 },
      ]),
    );

    expect(responseRes3.body.metadata).toEqual({
      quantiles: [0, 2.1, 8.5, 30, 90, 300, 900],
      unit: 'tonnes',
    });
  });
});
