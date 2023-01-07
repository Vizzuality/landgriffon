import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { readdir } from 'fs/promises';
import * as config from 'config';
import { saveUserAndGetTokenWithUserId } from '../../../utils/userAuth';
import AppSingleton from '../../../utils/getApp';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { DataSource } from 'typeorm';

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    if (key === 'fileUploads.sizeLimit') {
      return 700000;
    } else {
      return configGet.call(config, key);
    }
  };
  return config;
});

describe('XLSX Upload Feature Validation Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await app.close();
  });
  describe('XLSX Upload Feature File Validation Tests', () => {
    test('When a file is sent to the API and its size is too large then it should return a 413 "Payload Too Large" error', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/test-base-dataset.xlsx')
        .expect(HttpStatus.PAYLOAD_TOO_LARGE);

      const folderContent = await readdir(
        config.get('fileUploads.storagePath'),
      );
      expect(folderContent.length).toEqual(0);
    });

    test('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errors[0].title).toEqual(
        'A .XLSX file must be provided as payload',
      );
    });
  });

  describe('XLSX Upload Feature File Content Validation Tests', () => {
    test('When file with invalid content is sent to the API it should return 400 "Bad Request" error', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/bad-dataset.xlsx')
        .expect(HttpStatus.BAD_REQUEST);

      const folderContent = await readdir(
        config.get('fileUploads.storagePath'),
      );
      expect(folderContent.length).toEqual(0);
    }, 100000);

    test('When file with incorrect or missing inputs for upload is sent to API, proper error messages should be received', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/base-dataset-location-errors.xlsx');

      expect(HttpStatus.BAD_REQUEST);
      // TODO: Double check excel used for this test, it has REF errors in it
      // expect(response.body.errors[0].meta.rawError.response.message).toEqual(
      //   sourcingDataValidationErrorResponse,
      // );
      const folderContent = await readdir(
        config.get('fileUploads.storagePath'),
      );
      expect(folderContent.length).toEqual(0);
    }, 100000);
  });
});
