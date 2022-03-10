import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { readdir } from 'fs/promises';
import * as config from 'config';
import { ImportDataModule } from 'modules/import-data/import-data.module';
import { saveUserAndGetToken } from '../../../utils/userAuth';
import { getApp } from '../../../utils/getApp';

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    if (key === 'fileUploads.sizeLimit') {
      return 800000;
    } else {
      return configGet.call(config, key);
    }
  };
  return config;
});

describe('XLSX Upload Feature Validation Tests', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImportDataModule],
    }).compile();

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterAll(async () => {
    await app.close();
  });
  describe('XLSX Upload Feature File Validation Tests', () => {
    test('When a file is sent to the API and its size is too large then it should return a 413 "Payload Too Large" error', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/base-dataset.xlsx')
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
      const response = await request(app.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/base-dataset-location-errors.xlsx');

      expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errors[0].meta.rawError.response.message).toEqual([
        {
          line: 2,
          column: 'material.hsCode',
          errors: {
            minLength:
              'material.hsCode must be longer than or equal to 2 characters',
          },
        },
        {
          line: 2,
          column: 'location_country_input',
          errors: {
            isString: 'location_country_input must be a string',
            isNotEmpty: 'Location country input is required',
          },
        },
        {
          line: 2,
          column: 'location_address_input',
          errors: {
            location_address:
              'Address must be empty for locations of type unknown',
          },
        },
        {
          line: 2,
          column: 'location_latitude_input',
          errors: {
            latitude: 'Coordinates must be empty for locations of type unknown',
          },
        },
        {
          line: 2,
          column: 'location_longitude_input',
          errors: {
            longitude:
              'Coordinates must be empty for locations of type unknown',
          },
        },
        {
          line: 3,
          column: 'business_unit.path',
          errors: {
            isString: 'business_unit.path must be a string',
            isNotEmpty: 'Business Unit path cannot be empty',
          },
        },
        {
          line: 3,
          column: 'location_latitude_input',
          errors: {
            latitude:
              'Coordinates must be empty for locations of type country of production',
          },
        },
        {
          line: 3,
          column: 'location_longitude_input',
          errors: {
            longitude:
              'Coordinates must be empty for locations of type country of production',
          },
        },
        {
          line: 7,
          column: 'location_address_input',
          errors: {
            location_address:
              'Address input or coordinates are obligatory for locations of type aggregation point.',
          },
        },
        {
          line: 7,
          column: 'location_latitude_input',
          errors: {
            latitude:
              'Address input or coordinates are obligatory for locations of type aggregation point. Latitude values must be min: -90, max: 90',
          },
        },
        {
          line: 8,
          column: 'location_address_input',
          errors: {
            location_address:
              'Address input or coordinates are obligatory for locations of type point of production.',
          },
        },
        {
          line: 8,
          column: 'location_latitude_input',
          errors: {
            latitude:
              'Address input or coordinates are obligatory for locations of type point of production. Latitude values must be min: -90, max: 90',
          },
        },
        {
          line: 8,
          column: 'location_longitude_input',
          errors: {
            longitude:
              'Address input or coordinates are obligatory for locations of type point of production. Longitude values must be min: -180, max: 180',
          },
        },
        {
          line: 9,
          column: 'location_latitude_input',
          errors: {
            latitude:
              'Address input or coordinates are obligatory for locations of type point of production. Latitude values must be min: -90, max: 90',
          },
        },
        {
          line: 9,
          column: 'location_longitude_input',
          errors: {
            longitude:
              'Address input or coordinates are obligatory for locations of type point of production. Longitude values must be min: -180, max: 180',
          },
        },
        {
          line: 10,
          column: '2012_tons',
          errors: {
            min: '2012_tons must not be less than 0',
          },
        },
        {
          line: 10,
          column: '2015_tons',
          errors: {
            min: '2015_tons must not be less than 0',
          },
        },
      ]);
      const folderContent = await readdir(
        config.get('fileUploads.storagePath'),
      );
      expect(folderContent.length).toEqual(0);
    }, 100000);
  });
});
