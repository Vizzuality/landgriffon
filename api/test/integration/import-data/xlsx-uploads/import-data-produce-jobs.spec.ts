import { Queue } from 'bull';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { ImportDataModule } from 'modules/import-data/import-data.module';
import { getQueueToken } from '@nestjs/bull';
import { importQueueName } from 'modules/import-data/workers/import-data.producer';
import { ImportDataService } from 'modules/import-data/import-data.service';

// TODO: Update tests below once auth is done
describe('XLSX Upload Feature Job Producer Tests', () => {
  const importQueue: any = { add: jest.fn() };
  const importQueueFail: any = { add: jest.fn().mockRejectedValue('test') };
  let queue: Queue;
  let moduleFixture: TestingModule;
  let importDataService: ImportDataService;

  const bootstrapTestingApp = async (fakeQueue: any): Promise<void> => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, ImportDataModule],
    })
      .overrideProvider(getQueueToken(importQueueName.value))
      .useValue(fakeQueue)
      .compile();

    queue = moduleFixture.get(getQueueToken(importQueueName.value));
    importDataService = moduleFixture.get(ImportDataService);
  };

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleFixture.close();
  });

  test('When loadXlsxFile is called with required file data and a userId, Then a job should be pushed to the queue', async () => {
    await bootstrapTestingApp(importQueue);
    const xlsxFileData = { path: 'filepath' } as Express.Multer.File;
    const userId = '29b47625-9ffa-45a9-bfce-7a75abeb820e';
    await importDataService.loadXlsxFile(userId, xlsxFileData);

    expect(queue.add).toHaveBeenCalledWith('excel-import-job', {
      userId,
      xlsxFileData,
    });
  });
  test('When loadXlsxFile is called with required file data and a userId, but the Job can not be added to the queue, a error should be displayed', async () => {
    await bootstrapTestingApp(importQueueFail);
    const fileData = {
      path: 'filepath',
      filename: 'filename',
    } as Express.Multer.File;
    const userId = '29b47625-9ffa-45a9-bfce-7a75abeb820e';
    expect.assertions(1);
    try {
      await importDataService.loadXlsxFile(userId, fileData);
    } catch ({ message }) {
      expect(message).toEqual('File: filename could not have been loaded');
    }
  });
});
