import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { STORAGE_PATH } from '../../../src/utils/file-uploads.utils';

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

  describe('When a file is sent to the API', () => {
    describe('And its size is allowed', () => {
      test('Then it should return a 201 code', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/sourcing-records/submissions/xlsx')
          .attach('file', __dirname + '/base-dataset.xlsx')
          .expect(HttpStatus.CREATED);
      });
    });
  });
  describe('When a file is sent to the API', () => {
    describe('And gets processed', () => {
      test('Then the storage folder should be empty', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/sourcing-records/submissions/xlsx')
          .attach('file', __dirname + '/base-dataset.xlsx');
        const folderContent = await readdir(STORAGE_PATH);
        expect(folderContent.length).toEqual(0);
      });
    });
  });
});
