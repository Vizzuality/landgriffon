import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { readdir } from 'fs/promises';
import * as config from 'config';

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
    await Promise.all([app.close()]);
  });

  test.skip('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/sourcing-records/import')
      .expect(HttpStatus.BAD_REQUEST);

    // @todo: if easy, add an informative body message
  });

  test('When a file is sent to the API and its size is allowed then it should return a 201 code and the storage folder should be empty', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/sourcing-records/import')
      .attach('file', __dirname + '/base-dataset.xlsx')
      .expect(HttpStatus.CREATED);
    const folderContent = await readdir(config.get('fileUploads.storagePath'));
    expect(folderContent.length).toEqual(0);
  });
});
