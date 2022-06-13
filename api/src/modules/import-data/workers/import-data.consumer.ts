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
import { Task, TASK_STATUS } from 'modules/tasks/task.entity';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';

@Processor(importQueueName)
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
  async onJobFailed(job: Job<ExcelImportJob>, err: Error): Promise<void> {
    const task: Task | undefined = await this.tasksService.updateImportJobEvent(
      {
        taskId: job.data.taskId,
        newStatus: TASK_STATUS.FAILED,
        newErrors: err,
      },
    );
    this.logger.error(
      `Import Failed for file: ${job.data.xlsxFileData.filename} for task: ${task.id}: ${err}`,
    );
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
    this.logger.log(
      `Import XLSX with TASK ID: ${job.data.taskId} completed successfully`,
    );
    await this.tasksService.updateImportJobEvent({
      taskId: job.data.taskId,
      newStatus: TASK_STATUS.COMPLETED,
    });
  }
  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.importDataService.processImportJob(job);
  }
}
