import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { TasksService } from 'modules/tasks/tasks.service';
import { Task, TASK_STATUS } from 'modules/tasks/task.entity';

@Processor('excel-import')
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataService.name);
  constructor(
    public readonly importDataService: ImportDataService,
    public readonly tasksService: TasksService,
  ) {}

  @OnQueueFailed()
  async onJobFailed(job: Job<ExcelImportJob>, err: Error): Promise<void> {
    const task: Task | undefined = await this.tasksService.updateImportJobEvent(
      {
        taskId: job.data.taskId,
        newStatus: TASK_STATUS.FAILED,
        newErrors: { [err.name]: err.message },
      },
    );
    this.logger.error(
      `Import Failed for file: ${job.data.xlsxFileData.filename} for task: ${task.id}: ${err}`,
    );
  }

  @OnQueueCompleted()
  async onJobComplete(job: Job<ExcelImportJob>): Promise<void> {
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
