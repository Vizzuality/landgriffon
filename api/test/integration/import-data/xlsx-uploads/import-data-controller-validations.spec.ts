import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { readdir } from 'fs/promises';
import * as config from 'config';
import { ImportDataModule } from 'modules/import-data/import-data.module';

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    if (key === 'fileUploads.sizeLimit') {
      return 1;
    } else {
      return configGet.call(config, key);
    }
  };
  return config;
});

describe('XLSX Upload Feature Validation Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImportDataModule],
    }).compile();

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

  afterAll(async () => {
    await app.close();
  });

  test('When a file is sent to the API and its size is too large then it should return a 413 "Payload Too Large" error', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.PAYLOAD_TOO_LARGE);

    const folderContent = await readdir(config.get('fileUploads.storagePath'));
    expect(folderContent.length).toEqual(0);
  });

  test('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/import/sourcing-data')
      .expect(HttpStatus.BAD_REQUEST);
    expect(response.body.errors[0].title).toEqual(
      'A .XLSX file must be provided as payload',
    );
  });
});
