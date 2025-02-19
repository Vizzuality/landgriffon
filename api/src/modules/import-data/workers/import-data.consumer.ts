import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Job } from 'bull';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';
import { HandleImportFailedCommand } from '../cqrs/import-data-failed.handler';
import { StartImportProcessingCommand } from '../cqrs/import-data-processing.handler';
import { HandleImportSuccessCommand } from '../cqrs/import-data-success.handler';

@Processor(importQueueName)
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataConsumer.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) { }

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

  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    const { taskId, xlsxFileData } = job.data;
    // Delegate the processing logic to a command
    await this.commandBus.execute(new StartImportProcessingCommand(taskId, xlsxFileData));
  }

  private isJobStalled(err: Error): boolean {
    return err.message === 'job stalled more than allowable limit';
  }

  private async removeJob(job: Job<ExcelImportJob>): Promise<void> {
    return job.remove();
  }
}
