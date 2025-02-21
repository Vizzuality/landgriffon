import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Job, JobId, Queue } from 'bull';

import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';
import { ImportProgressSteps } from 'modules/events/import-data-progress/types';
import { ImportDataProgressObject } from 'modules/import-data/import-data-progress.object';

export const IMPORT_JOB_CACHE_KEY: string = 'import-job-cache-key';

export class ImportDataProgressEvent {
  constructor(public step: ImportProgressSteps, public progress: number) {}
}

@EventsHandler(ImportDataProgressEvent)
export class ImportDataProgressEventHandler
  implements IEventHandler<ImportDataProgressEvent>
{
  logger: Logger = new Logger(ImportDataProgressEventHandler.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectQueue(importQueueName) private readonly importQueue: Queue,
  ) {}

  /**
   * Retrieves the bull job instance from the queue and updates the progress triggering an event
   * @param event
   */
  async handle(event: ImportDataProgressEvent): Promise<void> {
    const jobId: JobId | undefined = await this.cacheManager.get(
      IMPORT_JOB_CACHE_KEY,
    );

    if (!jobId) {
      this.logger.warn('Could not find job id in cache for import progress');
      return;
    }

    const job: Job<ExcelImportJob> | null = await this.importQueue.getJob(
      jobId,
    );

    if (!job) {
      this.logger.warn('Could not find job in queue for import progress');
      return;
    }

    /*
    let currentProgress: ImportProgressObject | undefined = await job.progress();

    if(!currentProgress){
      currentProgress = new ImportProgressObject();
    }

     */

    await job.progress(
      new ImportDataProgressObject(event.step, event.progress),
    );
  }
}
