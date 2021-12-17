import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';

export interface ExcelImportJob {
  xlsxFilePath: string;
}

@Processor('excel-import')
export class ImportDataConsumer {
  constructor(public readonly importDataService: SourcingDataImportService) {}

  @Process('excel-import-job')
  async readImportDataJob(job: Job<ExcelImportJob>): Promise<void> {
    // TODO: add job outcome api event + notify user about result.
    await this.importDataService
      .importSourcingRecords(job.data.xlsxFilePath)
      // Hack to avoid unhandled prom exception. Delete when api events and notifications are in place
      .catch((err: Error) => err.message);
  }
}
