import * as request from 'supertest';
import { omit } from 'lodash';
import * as config from 'config';
import ApplicationManager, {
  TestApplication,
} from './utils/application-manager';
import { DataSource } from 'typeorm';
import { clearTestDataFromDatabase } from './utils/database-test-helper';

describe('JSON API Specs (e2e)', () => {
  let dataSource: DataSource;
  let testApplication: TestApplication;

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`,
      );
    }

    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  it('should return a response shaped as JSON:API Error spec, including ', async () => {
    const jsonApiErrorResponse = {
      id: null,
      links: null,
      status: null,
      code: null,
      source: null,
      title: null,
      meta: {
        timestamp: null,
        path: null,
        type: null,
        rawError: null,
        stack: null,
      },
    };
    const response = await request(testApplication.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: 'fakeuser@example.com',
        password: 'fakePassword',
      });
    response.body.errors.forEach((err: any) => {
      expect(Object.keys(jsonApiErrorResponse)).toEqual(
        expect.arrayContaining(Object.keys(err)),
      );
      /**
       * Should not include rawError and stack props in meta object if app is running on prod env
       */
      if (['development', 'test'].includes(config.util.getEnv('NODE_ENV'))) {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(jsonApiErrorResponse.meta),
        );
      } else {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(omit(jsonApiErrorResponse.meta, ['rawError', 'stack'])),
        );
      }
    });
  });
});
