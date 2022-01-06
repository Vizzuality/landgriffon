import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';

@Processor('excel-import')
export class ImportDataConsumer {
  logger: Logger = new Logger(ImportDataService.name);
  constructor(public readonly importDataService: ImportDataService) {}

  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.importDataService.processImportJob(job);
  }
}
