import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Task, TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';
import { TasksModule } from 'modules/tasks/tasks.module';
import { TasksRepository } from 'modules/tasks/tasks.repository';

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
          createdBy: '2a833cc7-5a6f-492d-9a60-0d6d056923ea',
          data: {
            filename: 'fakeFile.xlsx',
          },
        })
        .expect(HttpStatus.CREATED);

      const createdTask = await tasksRepository.findOne(response.body.data.id);

      if (!createdTask) {
        throw new Error('Error loading created Task');
      }

      expect(createdTask.createdBy).toEqual(
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
        'createdBy must be a UUID',
        'createdBy should not be empty',
      ],
    );
  });

  describe('Tasks - Update', () => {
    test('Updating a task should be successful (happy case)', async () => {
      const task: Task = new Task();
      task.createdBy = '2a833cc7-5a6f-492d-9a60-0d6d056923ea';
      task.type = TASK_TYPE.SOURCING_DATA_IMPORT;
      task.status = TASK_STATUS.PROCESSING;
      task.data = {
        filename: 'fakeFile.xlsx',
      };
      await task.save();

      const response = await request(app.getHttpServer())
        .put(`/api/v1/tasks`)
        .send({
          taskId: task.id,
          newStatus: TASK_STATUS.FAILED,
          newErrors: {
            name: 'FakeError',
            message: 'Fake Error Added',
          },
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.status).toEqual('failed');
      expect(response.body.data.attributes.errors[0].FakeError).toEqual(
        'Fake Error Added',
      );
    });

    test('Updating a task without task id and new status should return proper error message', async () => {
      const task: Task = new Task();
      task.createdBy = '2a833cc7-5a6f-492d-9a60-0d6d056923ea';
      task.type = TASK_TYPE.SOURCING_DATA_IMPORT;
      task.status = TASK_STATUS.PROCESSING;
      task.data = {
        filename: 'fakeFile.xlsx',
      };
      await task.save();

      const response = await request(app.getHttpServer())
        .put(`/api/v1/tasks`)
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'taskId must be a UUID',
          'taskId should not be empty',
          'newStatus must be a string',
          'newStatus should not be empty',
        ],
      );
    });
  });

  describe('Task - Delete', () => {
    test('Deleting a task should be successful (happy case)', async () => {
      const task: Task = new Task();
      task.createdBy = '2a833cc7-5a6f-492d-9a60-0d6d056923ea';
      task.type = TASK_TYPE.SOURCING_DATA_IMPORT;
      task.status = TASK_STATUS.PROCESSING;
      task.data = {
        filename: 'fakeFile.xlsx',
      };
      await task.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/tasks/${task.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await tasksRepository.findOne(task.id)).toBeUndefined();
    });
  });

  describe('Task - Find all', () => {
    test('Retrieving should be successful (happy case)', async () => {
      const task1: Task = new Task();
      task1.createdBy = '2a833cc7-5a6f-492d-9a60-0d6d056923ea';
      task1.type = TASK_TYPE.SOURCING_DATA_IMPORT;
      task1.status = TASK_STATUS.PROCESSING;
      task1.data = {
        filename: 'fakeFile.xlsx',
      };
      await task1.save();

      const task2: Task = new Task();
      task2.createdBy = '2a833cc7-5a6f-492d-9a60-0d6d056923bb';
      task2.type = TASK_TYPE.SOURCING_DATA_IMPORT;
      task2.status = TASK_STATUS.PROCESSING;
      task2.data = {
        filename: 'fakeFile2.xlsx',
      };
      await task2.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tasks`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(task1.id);
      expect(response.body.data[1].id).toEqual(task2.id);
    });
  });

  describe('Task - Get by id', () => {
    test('Retrieving a task by id should be successful (happy case)', async () => {
      const task: Task = new Task();
      task.createdBy = '2a833cc7-5a6f-492d-9a60-0d6d056923ea';
      task.type = TASK_TYPE.SOURCING_DATA_IMPORT;
      task.status = TASK_STATUS.ABORTED;
      task.data = {
        filename: 'fakeFile.xlsx',
      };
      await task.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tasks/${task.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(task.id);
      expect(response.body.data.attributes.status).toEqual(TASK_STATUS.ABORTED);
    });
  });
});
