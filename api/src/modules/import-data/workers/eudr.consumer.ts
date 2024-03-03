import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { TasksService } from 'modules/tasks/tasks.service';

export interface EudrImportJob {
  xlsxFileData: Express.Multer.File;
  taskId: string;
}

@Processor('eudr')
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataService.name);

  constructor(
    public readonly importDataService: ImportDataService,
    public readonly tasksService: TasksService,
  ) {}

  @OnQueueError()
  async onQueueError(error: Error): Promise<void> {
    throw new ServiceUnavailableException(
      `Could not connect to Redis through BullMQ: ${error.message}`,
    );
  }

  @OnQueueFailed()
  async onJobFailed(job: Job<EudrImportJob>, err: Error): Promise<void> {
    // TODO: Handle eudr-alerts import errors, updating async tgasks
    const { taskId } = job.data;
    this.logger.error(
      `Import Failed for file: ${job.data.xlsxFileData.filename} for task: ${taskId}: ${err}`,
    );
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
    this.logger.log(
      `Import XLSX with TASK ID: ${job.data.taskId} completed successfully`,
    );
    // TODO: Handle eudr-alerts import completion, updating async tasks
  }

  @Process('eudr')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.importDataService.processEudrJob(job);
  }
}
