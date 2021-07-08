import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { readdir } from 'fs/promises';
import * as config from 'config';

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

describe('XLSX Upload Feature Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
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
    jest.clearAllMocks();
  });

  test('When a file is sent to the API and its size is too large then it should return a 413 "Payload Too Large" error', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/sourcing-records/import')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.PAYLOAD_TOO_LARGE);

    const folderContent = await readdir(config.get('fileUploads.storagePath'));
    expect(folderContent.length).toEqual(0);
  });
});
