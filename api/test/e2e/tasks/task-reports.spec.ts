import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Task, TASK_TYPE } from 'modules/tasks/task.entity';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { createTask } from '../../entity-mocks';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { setupTestUser } from '../../utils/userAuth';
import { v4 } from 'uuid';

/**
 * Tests for Tasks Module.
 */

describe('Tasks Get Reports (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    const tokenWithId = await setupTestUser(testApplication);
    jwtToken = tokenWithId.jwtToken;
  });

  afterEach(async () => {
    await dataSource.getRepository(Task).delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Error Reports', () => {
    test('When I request a error report for a task, But there is no task found, I should get an error', async () => {
      await request(testApplication.getHttpServer())
        .get(`/api/v1/tasks/report/errors/${v4()}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          type: TASK_TYPE.SOURCING_DATA_IMPORT,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
    test('Creating a task without being authenticated should return a 401 error', async () => {
      const task = await createTask({
        errors: [
          {
            row: 1,
            error: 'Fake Error',
            column: 'Fake Column',
            sheet: 'Fake Sheet',
            type: 'Fake Type',
          },
          {
            row: 2,
            error: 'Fake Error 2',
            column: 'Fake Column',
            sheet: 'Fake Sheet',
            type: 'Fake Type',
          },
        ],
      });

      const expectedCSV = `"row","error","column","sheet","type"\n${task.errors
        .map(
          (error: any) =>
            `${error.row},"${error.error}","Fake Column","Fake Sheet","Fake Type"`,
        )
        .join('\n')}`;

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/tasks/report/errors/${task.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({
          type: TASK_TYPE.SOURCING_DATA_IMPORT,
        });

      expect(response.text).toEqual(expectedCSV);
    });
  });
});
