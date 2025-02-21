import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueProgress,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Job } from 'bull';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';
import { HandleImportFailedCommand } from 'modules/import-data/cqrs/import-data-failed.handler';
import { StartImportProcessingCommand } from 'modules/import-data/cqrs/import-data-processing.handler';
import { HandleImportSuccessCommand } from 'modules/import-data/cqrs/import-data-success.handler';
import { Cache } from 'cache-manager';
import { ImportProgressSocket } from 'modules/events/import-data-progress/import-progress.socket';
import { ImportDataProgressObject } from 'modules/import-data/import-data-progress.object';
import { IMPORT_JOB_CACHE_KEY } from 'modules/import-data/cqrs/import-data-progress.handler';

@Processor(importQueueName)
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataConsumer.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly importProgressSocket: ImportProgressSocket,
    private readonly cache: Cache,
  ) {}

  @OnQueueError()
  async onQueueError(error: Error): Promise<void> {
    throw new ServiceUnavailableException(
      `Could not connect to Redis through BullMQ: ${error.message}`,
    );
  }

  @OnQueueFailed()
  async onJobFailed(job: Job<ExcelImportJob>, err: any): Promise<void> {
    if (this.isJobStalled(err)) {
      return this.removeJob(job);
    }

    // Delegate the failure logic to a command
    await this.commandBus.execute(
      new HandleImportFailedCommand(
        job.data.taskId,
        job.data.xlsxFileData,
        err,
      ),
    );
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
    // Delegate the success logic to a command
    await this.commandBus.execute(
      new HandleImportSuccessCommand(job.data.taskId, job.data.xlsxFileData),
    );
  }

  @OnQueueProgress()
  async onJobProgress(
    job: Job<ExcelImportJob>,
    progress: ImportDataProgressObject,
  ): Promise<void> {
    this.logger.debug(`Job ${job.id} progress: ${JSON.stringify(progress)}`);

    // Emit the progress to the socket
    this.importProgressSocket.emitProgressUpdateToSocket(progress.payload);
  }

  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    const { taskId, xlsxFileData } = job.data;

    // set the job id in the cache so we can reference it later for tracking
    await this.cache.set(IMPORT_JOB_CACHE_KEY, job.id);

    // Delegate the processing logic to a command
    await this.commandBus.execute(
      new StartImportProcessingCommand(taskId, xlsxFileData),
    );
  }

  private isJobStalled(err: Error): boolean {
    return err.message === 'job stalled more than allowable limit';
  }

  private async removeJob(job: Job<ExcelImportJob>): Promise<void> {
    return job.remove();
  }
  /*
  registerJobEventHandler(job: Job<ExcelImportJob>): void {
    if (!this.importProgressEventHandler) {
      this.importProgressEventHandler = new ImportProgressTrackerEventHandler(
        job,
      );
    }
    this.eventBus.register([new ImportProgressTrackerEventHandler(job)]);
  }

  unregisterJobEventHandler(): void {
    if (this.importProgressEventHandler) {
      this.eventBus.([this.importProgressEventHandler]);
    }
  }

 */
}
