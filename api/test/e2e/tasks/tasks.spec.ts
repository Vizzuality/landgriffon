import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Task, TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { createTask, createUser } from '../../entity-mocks';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { setupTestUser } from '../../utils/userAuth';
import { User } from 'modules/users/user.entity';

/**
 * Tests for Tasks Module.
 */

describe('Tasks Module (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let tasksRepository: TasksRepository;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
    tasksRepository = testApplication.get<TasksRepository>(TasksRepository);

    const tokenWithId = await setupTestUser(testApplication);
    jwtToken = tokenWithId.jwtToken;
    userId = tokenWithId.user.id;
  });

  afterEach(async () => {
    await dataSource.getRepository(Task).delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Tasks - Create', () => {
    test('Creating a new task (happy case)', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          type: TASK_TYPE.SOURCING_DATA_IMPORT,
          status: TASK_STATUS.PROCESSING,
          data: {
            filename: 'fakeFile.xlsx',
          },
        })
        .expect(HttpStatus.CREATED);

      const createdTask = await tasksRepository.findOne({
        where: { id: response.body.data.id },
      });

      if (!createdTask) {
        throw new Error('Error loading created Task');
      }

      expect(createdTask.userId).toEqual(userId);
      expect(createdTask.data.filename).toEqual('fakeFile.xlsx');
    });
  });

  test('Creating a task without being authenticated should return a 401 error', async () => {
    await request(testApplication.getHttpServer())
      .post('/api/v1/tasks')
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });

  test('Creating a task without required fields should return a 400 error', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'type must be a string',
        'type should not be empty',
        'status must be a string',
        'status should not be empty',
      ],
    );
  });

  describe('Tasks - Update', () => {
    test('Updating a task should be successful (happy case)', async () => {
      const user: User = await createUser();
      const task: Task = await createTask({
        status: TASK_STATUS.ABORTED,
        userId: user.id,
      });

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          status: TASK_STATUS.FAILED,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.status).toEqual(TASK_STATUS.FAILED);
    });

    test('Marking a task as dismissed without the value being a UUID should throw an error', async () => {
      const task = await createTask();

      await request(testApplication.getHttpServer())
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ dismissedBy: 'not a uuid' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    test('Marking a task as dismissed should be successful (happy case)', async () => {
      const task = await createTask();

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ dismissedBy: userId })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.dismissedBy).toEqual(userId);
    });
  });

  describe('Task - Delete', () => {
    test('Deleting a task should be successful (happy case)', async () => {
      const task: Task = await createTask();

      await request(testApplication.getHttpServer())
        .delete(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await tasksRepository.findOne({ where: { id: task.id } }),
      ).toBeNull();
    });
  });

  describe('Task - Find all', () => {
    test('Retrieving should be successful (happy case)', async () => {
      const task1: Task = await createTask({
        status: TASK_STATUS.PROCESSING,
      });
      const task2: Task = await createTask({
        status: TASK_STATUS.FAILED,
      });

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/tasks`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(task1.id);
      expect(response.body.data[0].attributes.status).toEqual('processing');
      expect(response.body.data[1].id).toEqual(task2.id);
      expect(response.body.data[1].attributes.status).toEqual('failed');
    });
  });

  describe('Task - Get by id', () => {
    test('Retrieving a task by id should be successful (happy case)', async () => {
      const task: Task = await createTask({
        status: TASK_STATUS.ABORTED,
      });

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(task.id);
      expect(response.body.data.attributes.status).toEqual(TASK_STATUS.ABORTED);
    });
  });
});
