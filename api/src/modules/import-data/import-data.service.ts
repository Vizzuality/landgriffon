import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ExcelImportJob,
  ImportDataProducer,
} from 'modules/import-data/workers/import-data.producer';
import { Job } from 'bull';
import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import { JobEventsService } from 'modules/job-events/job-events.service';

@Injectable()
export class ImportDataService {
  logger: Logger = new Logger(ImportDataService.name);
  constructor(
    private readonly importDataProducer: ImportDataProducer,
    private readonly sourcingDataImportService: SourcingDataImportService,
    private readonly jobEvents: JobEventsService,
  ) {}

  async loadXlsxFile(
    userId: string,
    xlsxFileData: Express.Multer.File,
  ): Promise<void> {
    const { filename, path: xlsxFilePath } = xlsxFileData;
    try {
      await this.importDataProducer.addExcelImportJob(xlsxFilePath, userId);
    } catch ({ message }) {
      this.logger.warn(
        `Job for file: ${filename} sent by user: ${userId} could not been added to queue`,
      );
      throw new ServiceUnavailableException(
        `File: ${filename} could not have been loaded`,
      );
    }
  }

  async processImportJob(job: Job<ExcelImportJob>): Promise<void> {
    try {
      // TODO: Handle event
      await this.sourcingDataImportService.importSourcingRecords(
        job.data.xlsxFilePath,
      );
    } catch (error: any) {
      this.logger.error(
        `Import Failed for ${job.data.xlsxFilePath} sent by user ${job.data.userId}: ${error.message}`,
      );
    }
  }
}
