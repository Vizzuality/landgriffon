import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import { createFakeH3Data, dropFakeH3Data } from './mocks/create-fake-h3-data';

/**
 * Tests for the H3DataModule.
 */

describe('H3-Data Module (e2e)', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);

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
    await h3DataRepository.delete({});
    await dropFakeH3Data(fakeTable);
  });

  afterAll(async () => {
    await dropFakeH3Data(fakeTable);
    await Promise.all([app.close()]);
  });

  describe('H3 Data Module E2E Test Suite', () => {
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
      expect(response.body).toEqual({ data: { '861203a4fffffff': 1000 } });
    });
    test('When I query a H3 data with a non available resolution, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/v1/h3/data/doYouLikeMyFakeId?resolution=0`,
      );
      expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
        'Available resolutions: 1 to 6',
      );
    });
    test('When I query a H3 data with a resolution value that is not a number, then I should get a proper error message', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/v1/h3/data/doYouLikeMyFakeId?resolution=definitelyNotANumber`,
      );
      expect(response.body.errors[0].meta.rawError.response.message[1]).toEqual(
        'resolution must be a number conforming to the specified constraints',
      );
    });
    test('When I query a H3 data by its ID and it does not exist, then I should get a proper error message', async () => {
      const FAKE_UUID = '959dc56e-a782-441a-be36-1aaa617ed843';
      const response = await request(app.getHttpServer()).get(
        `/api/v1/h3/data/${FAKE_UUID}?resolution=1`,
      );
      expect(response.body.errors[0].title).toEqual(
        `Requested H3 with ID: ${FAKE_UUID} could not been found`,
      );
    });
    test('When I query H3 data with no resolution provided, then I should get a proper error message', async () => {
      const id = await createFakeH3Data(fakeTable, fakeColumn, true);
      const response = await request(app.getHttpServer()).get(
        `/api/v1/h3/data/${id}`,
      );
      expect(response.body.errors[0].meta.rawError.response.message[2]).toEqual(
        'resolution should not be empty',
      );
    });

    test('When I query H3 data at minimal resolution, then I should get 8 h3indexes', async () => {
      const id = await createFakeH3Data(fakeTable, fakeColumn, true);
      const response = await request(app.getHttpServer()).get(
        `/api/v1/h3/data/${id}?resolution=1`,
      );

      expect(response.body).toEqual({
        '81123ffffffffff': 1000,
        '8112fffffffffff': 0,
        '8128bffffffffff': 0,
        '8127bffffffffff': 0,
        '8112bffffffffff': 0,
        '81273ffffffffff': 0,
        '8128fffffffffff': 0,
        '81127ffffffffff': 0,
      });
    });
  });
});
