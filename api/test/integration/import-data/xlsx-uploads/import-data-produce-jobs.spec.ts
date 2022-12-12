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

// TODO: Update tests below once auth is done
describe('XLSX Upload Feature Job Producer Tests', () => {
  const userId = '29b47625-9ffa-45a9-bfce-7a75abeb820e';
  const importQueue: any = { add: jest.fn() };
  const importQueueFail: any = { add: jest.fn().mockRejectedValue('test') };
  let queue: Queue;
  let testApplication: TestApplication;
  let importDataService: ImportDataService;
  let taskRepository: TasksRepository;

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
    taskRepository = testApplication.get(TasksRepository);
  };

  afterEach(async () => {
    jest.clearAllMocks();
    await taskRepository.clear();
    await testApplication.close();
  });

  test('When loadXlsxFile is called with required file data and a userId, Then a job should be pushed to the queue and a task with a processing status should be created', async () => {
    await bootstrapTestingApp(importQueue);
    const xlsxFileData = { path: 'filepath' } as Express.Multer.File;
    await importDataService.loadXlsxFile(userId, xlsxFileData);

    const tasks: Task[] | undefined = await taskRepository.find();

    expect(queue.add).toHaveBeenCalledWith('excel-import-job', {
      taskId: tasks[0].id,
      xlsxFileData,
    });
    expect(tasks[0].status).toEqual('processing');
    expect(tasks[0].userId).toEqual(userId);
  }, 100000);
  test('When loadXlsxFile is called with required file data and a userId, but the Job can not be added to the queue, and the related tasks should be removed', async () => {
    await bootstrapTestingApp(importQueueFail);
    const fileData = {
      path: 'filepath',
      filename: 'filename',
    } as Express.Multer.File;
    expect.assertions(2);
    try {
      await importDataService.loadXlsxFile(userId, fileData);
    } catch ({ message }) {
      const tasks: Task[] | undefined = await taskRepository.find();
      expect(message).toEqual(
        'File: filename could not have been loaded. Please try again later or contact the administrator',
      );
      expect(tasks).toEqual([]);
    }
  });
});
