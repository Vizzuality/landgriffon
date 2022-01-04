import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { JobEventsService } from 'modules/job-events/job-events.service';
import { JOB_STATUS } from 'modules/job-events/job-event.entity';

@Processor('excel-import')
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataService.name);
  constructor(
    public readonly importDataService: ImportDataService,
    public readonly jobEvents: JobEventsService,
  ) {}

  @OnQueueActive()
  async onJobStarted(job: Job<ExcelImportJob>): Promise<void> {
    await this.jobEvents.updateImportJobEvent({
      redisJobId: job.id,
      newStatus: JOB_STATUS.PROCESSING,
    });
  }

  @OnQueueFailed()
  async onJobFailed(job: Job<ExcelImportJob>, err: Error): Promise<void> {
    this.logger.error(
      `Import Failed for file: ${job.data.xlsxFileData.filename} sent by user: ${job.data.userId}: ${err}`,
    );
    await this.jobEvents.updateImportJobEvent({
      redisJobId: job.id,
      newStatus: JOB_STATUS.FAILED,
      newErrors: { [err.name]: err.message },
    });
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
    await this.jobEvents.updateImportJobEvent({
      redisJobId: job.id,
      newStatus: JOB_STATUS.COMPLETED,
    });
  }
  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.importDataService.processImportJob(job);
  }
}
