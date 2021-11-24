import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import { createFakeH3Data, dropFakeH3Data } from './mocks/create-fake-h3-data';
import { h3MaterialFixtures } from './mocks/h3-fixtures';
import { createMaterial } from '../entity-mocks';
import { MaterialRepository } from '../../src/modules/materials/material.repository';

/**
 * Tests for the H3DataModule.
 */

describe('H3 Data Module (e2e) - Material map', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  const FAKE_UUID = '959dc56e-a782-441a-be36-1aaa617ed843';
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

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
    await h3DataRepository.delete({});
    await dropFakeH3Data([fakeTable]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('When I query a material H3 with a non available resolution, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/map/material?materialId=${FAKE_UUID}&resolution=0`,
    );
    expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
      'Available resolutions: 1 to 6',
    );
  });

  test('When I query a material H3 data with a resolution value that is not a number, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/map/material?materialId=${FAKE_UUID}&resolution=definitelyNotANumber`,
    );
    expect(response.body.errors[0].meta.rawError.response.message[1]).toEqual(
      'resolution must be a number conforming to the specified constraints',
    );
  });

  test('When I query a material H3 data but it has no H3 data available, then I should get a proper error message', async () => {
    const material = await createMaterial({ name: 'Material with no H3' });
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/map/material?materialId=${material.id}&resolution=1`,
    );
    expect(response.body.errors[0].title).toEqual(
      `There is no H3 Data for Material with ID: ${material.id}`,
    );
  });

  test('When I query a material H3 data with no resolution provided, then I should get a proper error message', async () => {
    const material = await createMaterial();
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/map/material?materialId=${material.id}`,
    );
    expect(response.body.errors[0].meta.rawError.response.message[2]).toEqual(
      'resolution should not be empty',
    );
  });

  test('When I query H3 data at minimal resolution, then I should 2 h3indexes and no 0 as value', async () => {
    const h3Data = await createFakeH3Data(
      fakeTable,
      fakeColumn,
      h3MaterialFixtures,
    );
    const material = await createMaterial({ producer: h3Data });
    const response = await request(app.getHttpServer()).get(
      `/api/v1/h3/map/material?materialId=${material.id}&resolution=1`,
    );

    expect(response.body.data).toEqual([
      { h: '81123ffffffffff', v: 1000 },
      { h: '8112fffffffffff', v: 1000 },
    ]);

    expect(response.body.metadata).toEqual({
      quantiles: [1000, 1000, 1000, 1000, 1000, 1000, 1000],
      unit: 'tonnes',
    });
  });
});
