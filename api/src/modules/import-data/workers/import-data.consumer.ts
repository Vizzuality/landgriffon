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
import { Task, TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';
import { ImportProgressSocket } from 'modules/events/import-data-progress/import-progress.socket';
import { ImportMailService } from 'modules/import-data/import-mail/import-mail.service';
import { EventBus } from '@nestjs/cqrs';
import {
  IMPORT_DATA_EVENTS,
  ImportDataEvent,
} from '../../events/import-data-events/import-data.event-handler';

@Processor(importQueueName)
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataService.name);

  constructor(
    public readonly importDataService: ImportDataService,
    public readonly tasksService: TasksService,
    public readonly importSocket: ImportProgressSocket,
    public readonly importMail: ImportMailService,
    public readonly eventBus: EventBus,
  ) {}

  @OnQueueError()
  async onQueueError(error: Error): Promise<void> {
    throw new ServiceUnavailableException(
      `Could not connect to Redis through BullMQ: ${error.message}`,
    );
  }

  // TODO: we probably want to handle success and failures using CQRS

  @OnQueueFailed()
  async onJobFailed(job: Job<ExcelImportJob>, err: any): Promise<void> {
    if (this.isJobStalled(err)) {
      return this.removeJob(job);
    }
    const task: Task | undefined = await this.tasksService.updateImportTask({
      taskId: job.data.taskId,
      newStatus: TASK_STATUS.FAILED,
      message: err.message,
      newErrors: err.validationErrors,
    });
    this.importSocket.emitImportFailureToSocket({ error: err });
    this.eventBus.publish(
      new ImportDataEvent(task.id, IMPORT_DATA_EVENTS.FAILED, {
        error: { message: err.message, stack: err.stack },
      }),
    );

    this.logger.error(
      `Import Failed for file: ${job.data.xlsxFileData.filename} for task: ${task.id}: ${err}`,
    );

    // TODO: If the error is not related to the file, we should not send an error report (as it will be empty), we should send a generic error message
    //       Since we are registering api events for the import now, it might be useful to include the id of the event so that the client
    //       can share it with the support team

    const errorReport: string = await this.tasksService.getTaskErrorReport(
      task.id,
      {
        type: TASK_TYPE.SOURCING_DATA_IMPORT,
      },
    );

    await this.importMail.sendImportFailureMail({
      email: task.user.email,
      fileName: job.data.xlsxFileData.originalname,
      importDate: task.createdAt,
      errorContent: errorReport,
    });
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
    const task: Task = await this.tasksService.updateImportTask({
      taskId: job.data.taskId,
      newStatus: TASK_STATUS.COMPLETED,
    });

    this.importSocket.emitImportCompleteToSocket({ status: 'completed' });
    this.eventBus.publish(
      new ImportDataEvent(task.id, IMPORT_DATA_EVENTS.SUCCEED, {
        file: job.data.xlsxFileData.originalname,
        userId: task.user.id,
      }),
    );
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
    this.eventBus.publish(
      new ImportDataEvent(job.data.taskId, IMPORT_DATA_EVENTS.STARTED, {
        file: job.data.xlsxFileData.originalname,
      }),
    );
    return this.importDataService.processImportJob(job);
  }

  private isJobStalled(err: Error): boolean {
    return err.message === 'job stalled more than allowable limit';
  }

  private async removeJob(job: Job<ExcelImportJob>): Promise<void> {
    return job.remove();
  }
}
