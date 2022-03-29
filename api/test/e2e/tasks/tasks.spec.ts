import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Task, TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';
import { TasksModule } from 'modules/tasks/tasks.module';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { createTask } from '../../entity-mocks';

/**
 * Tests for Tasks Module.
 */

describe('Tasks Module (e2e)', () => {
  let app: INestApplication;
  let tasksRepository: TasksRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TasksModule],
    }).compile();

    tasksRepository = moduleFixture.get<TasksRepository>(TasksRepository);

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

  afterEach(async () => {
    await tasksRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tasks - Create', () => {
    test('Creating a new task (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          type: TASK_TYPE.SOURCING_DATA_IMPORT,
          status: TASK_STATUS.PROCESSING,
          userId: '2a833cc7-5a6f-492d-9a60-0d6d056923ea',
          data: {
            filename: 'fakeFile.xlsx',
          },
        })
        .expect(HttpStatus.CREATED);

      const createdTask = await tasksRepository.findOne(response.body.data.id);

      if (!createdTask) {
        throw new Error('Error loading created Task');
      }

      expect(createdTask.userId).toEqual(
        '2a833cc7-5a6f-492d-9a60-0d6d056923ea',
      );
      expect(createdTask.data.filename).toEqual('fakeFile.xlsx');
    });
  });

  test('Creating a task without required fields should return a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
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
        'userId must be a UUID',
        'userId should not be empty',
      ],
    );
  });

  describe('Tasks - Update', () => {
    test('Updating a task should be successful (happy case)', async () => {
      const task: Task = await createTask({
        status: TASK_STATUS.ABORTED,
        userId: '2a833cc7-5a6f-492d-9a60-0d6d056923eb',
      });

      const response = await request(app.getHttpServer())
        .put(`/api/v1/tasks`)
        .send({
          taskId: task.id,
          newStatus: TASK_STATUS.FAILED,
          newData: {
            file2: 'File2',
          },
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.status).toEqual('failed');
      expect(response.body.data.attributes.userId).toEqual(
        '2a833cc7-5a6f-492d-9a60-0d6d056923eb',
      );
      expect(response.body.data.attributes.data.file2).toEqual('File2');
    });

    test('Updating a task without task id should return proper error message', async () => {
      await createTask();

      const response = await request(app.getHttpServer())
        .put(`/api/v1/tasks`)
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        ['taskId must be a UUID', 'taskId should not be empty'],
      );
    });
  });

  describe('Task - Delete', () => {
    test('Deleting a task should be successful (happy case)', async () => {
      const task: Task = await createTask();

      await request(app.getHttpServer())
        .delete(`/api/v1/tasks/${task.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await tasksRepository.findOne(task.id)).toBeUndefined();
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tasks`)
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tasks/${task.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(task.id);
      expect(response.body.data.attributes.status).toEqual(TASK_STATUS.ABORTED);
    });
  });
});
