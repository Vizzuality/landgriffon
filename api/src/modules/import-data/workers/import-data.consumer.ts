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
import { ImportProgressSocket } from 'modules/events/import-data/import-progress.socket';
import { ImportMailService } from 'modules/import-data/import-mail/import-mail.service';

@Processor(importQueueName)
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataService.name);

  constructor(
    public readonly importDataService: ImportDataService,
    public readonly tasksService: TasksService,
    public readonly importSocket: ImportProgressSocket,
    public readonly importMail: ImportMailService,
  ) {}

  @OnQueueError()
  async onQueueError(error: Error): Promise<void> {
    throw new ServiceUnavailableException(
      `Could not connect to Redis through BullMQ: ${error.message}`,
    );
  }

  // TODO: Handle events finished and failed cases

  @OnQueueFailed()
  async onJobFailed(job: Job<ExcelImportJob>, err: Error): Promise<void> {
    const task: Task | undefined = await this.tasksService.updateImportTask({
      taskId: job.data.taskId,
      newStatus: TASK_STATUS.FAILED,
      message: err.message,
    });
    this.importSocket.emitImportFailureToSocket({ error: err });

    this.logger.error(
      `Import Failed for file: ${job.data.xlsxFileData.filename} for task: ${task.id}: ${err}`,
    );
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
    const task: Task = await this.tasksService.updateImportTask({
      taskId: job.data.taskId,
      newStatus: TASK_STATUS.COMPLETED,
    });

    this.importSocket.emitImportCompleteToSocket({ status: 'completed' });
    await this.importMail.sendImportSuccessMail({
      email: task.user.email,
      fileName: job.data.xlsxFileData.originalname,
      importDate: task.createdAt,
    });
    this.logger.log(
      `Import Completed for file: ${job.data.xlsxFileData.filename} for task: ${task.id}`,
    );
  }

  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.importDataService.processImportJob(job);
  }
}
