import { Queue } from 'bull';
import { Test } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { getQueueToken } from '@nestjs/bull';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { TasksRepository } from 'modules/tasks/tasks.repository';
import { Task } from 'modules/tasks/task.entity';
import ApplicationManager, {
  TestApplication,
} from '../../../utils/application-manager';
import { User } from 'modules/users/user.entity';
import { createUser } from '../../../entity-mocks';
import { DataSource } from 'typeorm';
import { clearTestDataFromDatabase } from '../../../utils/database-test-helper';

// TODO: Update tests below once auth is done
describe('XLSX Upload Feature Job Producer Tests', () => {
  const importQueue: any = { add: jest.fn() };
  const importQueueFail: any = { add: jest.fn().mockRejectedValue('test') };
  let queue: Queue;
  let testApplication: TestApplication;
  let importDataService: ImportDataService;
  let dataSource: DataSource;
  let tasksRepository: TasksRepository;

  const bootstrapTestingApp = async (fakeQueue: any): Promise<void> => {
    testApplication = await ApplicationManager.init(
      Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(getQueueToken(importQueueName))
        .useValue(fakeQueue),
      true,
    );

    queue = testApplication.get(getQueueToken(importQueueName));

    importDataService = testApplication.get(ImportDataService);

    dataSource = testApplication.get<DataSource>(DataSource);

    tasksRepository = testApplication.get<TasksRepository>(TasksRepository);
  };

  afterEach(async () => {
    jest.clearAllMocks();
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('When loadXlsxFile is called with required file data and a userId, Then a job should be pushed to the queue and a task with a processing status should be created', async () => {
    await bootstrapTestingApp(importQueue);
    const user = await createUser();

    const xlsxFileData = { path: 'filepath' } as Express.Multer.File;
    await importDataService.loadXlsxFile(user.id, xlsxFileData);

    const tasks: Task[] | undefined = await tasksRepository.find();

    expect(queue.add).toHaveBeenCalledWith('excel-import-job', {
      taskId: tasks[0].id,
      xlsxFileData,
    });
    expect(tasks[0].status).toEqual('processing');
    expect(tasks[0].userId).toEqual(user.id);
  }, 100000);
  test('When loadXlsxFile is called with required file data and a userId, but the Job can not be added to the queue, and the related tasks should be removed', async () => {
    await bootstrapTestingApp(importQueueFail);
    const user = await createUser();
    const fileData = {
      path: 'filepath',
      filename: 'filename',
    } as Express.Multer.File;
    expect.assertions(2);
    try {
      await importDataService.loadXlsxFile(user.id, fileData);
    } catch ({ message }) {
      const tasks: Task[] | undefined = await tasksRepository.find();
      expect(message).toEqual(
        'File: filename could not have been loaded. Please try again later or contact the administrator',
      );
      expect(tasks).toEqual([]);
    }
  });
});
