import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import { createFakeH3Data, dropFakeH3Data } from './mocks/create-fake-h3-data';
import { MaterialRepository } from '../../src/modules/materials/material.repository';

/**
 * Tests for the H3DataModule.
 */

describe('H3-Data Module (e2e) - Get H3 data', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
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
    await h3DataRepository.delete({});
    await dropFakeH3Data([fakeTable]);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  test('Given the H3 Data table is empty, when I query the API, then I should be acknowledged that no requested H3 Data has been found ', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/data/${fakeTable}/${fakeColumn}`)
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.errors[0].title).toEqual(
      `H3 ${fakeColumn} data in ${fakeTable} could not been found`,
    );
  });

  test('Given the H3 Data table is populated, when I query the API, then I should get its data in with h3index as key, and column values as value', async () => {
    await createFakeH3Data(fakeTable, fakeColumn);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/data/${fakeTable}/${fakeColumn}`)
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual({ h: '861203a4fffffff', v: 1000 });
  });
});
