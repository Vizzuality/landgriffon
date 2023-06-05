import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { readdir } from 'fs/promises';
import * as config from 'config';
import { setupTestUser } from '../../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AppModule } from 'app.module';

describe('XLSX Upload Feature Validation Tests', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init(
      Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider('FILE_UPLOAD_SIZE_LIMIT')
        .useValue(700000),
    );

    dataSource = testApplication.get<DataSource>(DataSource);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('XLSX Upload Feature File Validation Tests', () => {
    test('When a file is sent to the API and its size is too large then it should return a 413 "Payload Too Large" error', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/files/test-base-dataset.xlsx')
        .expect(HttpStatus.PAYLOAD_TOO_LARGE);

      const folderContent = await readdir(
        config.get('fileUploads.storagePath'),
      );
      expect(folderContent.length).toEqual(0);
    });

    test('When a file is not sent to the API then it should return a 400 code and the storage folder should be empty', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errors[0].title).toEqual(
        'A .XLSX file must be provided as payload',
      );
    });
  });

  // TODO: Move this to integration tests sets as all types of validations will be moved to a async queue
  describe.skip('XLSX Upload Feature File Content Validation Tests', () => {
    test('When file with invalid content is sent to the API it should return 400 "Bad Request" error', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/files/bad-dataset.xlsx')
        .expect(HttpStatus.BAD_REQUEST);

      const folderContent = await readdir(
        config.get('fileUploads.storagePath'),
      );
      expect(folderContent.length).toEqual(0);
    }, 100000);

    test('When file with incorrect or missing inputs for upload is sent to API, proper error messages should be received', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/import/sourcing-data')
        .set('Authorization', `Bearer ${jwtToken}`)
        .attach('file', __dirname + '/files/base-dataset-location-errors.xlsx');

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
