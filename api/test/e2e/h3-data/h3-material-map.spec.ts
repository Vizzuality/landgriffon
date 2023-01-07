import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { h3DataMock, dropH3DataMock } from './mocks/h3-data.mock';
import { createMaterial, createMaterialToH3 } from '../../entity-mocks';
import { MaterialRepository } from 'modules/materials/material.repository';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { h3MaterialExampleDataFixture } from './mocks/h3-fixtures';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { DataSource } from 'typeorm';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';

/**
 * Tests for the H3DataModule.
 */

describe('H3 Data Module (e2e) - Material map', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  let materialToH3Service: MaterialsToH3sService;
  const FAKE_UUID = '959dc56e-a782-441a-be36-1aaa617ed843';
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    materialToH3Service = moduleFixture.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    dataSource = moduleFixture.get<DataSource>(DataSource);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await dropH3DataMock(dataSource, [fakeTable]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });

  test('When I query a material H3 with a non available resolution, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/material?materialId=${FAKE_UUID}&resolution=0`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'Available resolutions: 1 to 6',
    );
  });

  test('When I query a material H3 data with a resolution value that is not a number, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/api/v1/h3/map/material?materialId=${FAKE_UUID}&resolution=definitelyNotANumber`,
      )
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(response.body.errors[0].meta.rawError.response.message[1]).toEqual(
      'resolution must be a number conforming to the specified constraints',
    );
  });

  test('When I query a material H3 data but it has no year value, then I should get a proper error message', async () => {
    const material = await createMaterial({ name: 'Material with no H3' });
    const response = await request(app.getHttpServer())
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
    const response = await request(app.getHttpServer())
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
    const response = await request(app.getHttpServer())
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
    const responseRes1 = await request(app.getHttpServer())
      .get(`/api/v1/h3/map/material`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        materialId: material.id,
        resolution: 1,
        year: 2020,
      });

    const responseRes3 = await request(app.getHttpServer())
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
      quantiles: [
        0, 615.037, 800.0275, 812.5, 825.0784999999998, 1218.3635000000002,
        1610,
      ],
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
      quantiles: [
        0, 200.006, 231.1110000000001, 735, 750.01, 800.1320000000001, 860,
      ],
      unit: 'tonnes',
    });
  });
});
