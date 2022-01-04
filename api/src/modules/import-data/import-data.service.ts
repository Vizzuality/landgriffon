import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ImportDataProducer } from 'modules/import-data/workers/import-data.producer';
import { Job } from 'bull';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';

@Injectable()
export class ImportDataService {
  logger: Logger = new Logger(ImportDataService.name);
  constructor(
    private readonly importDataProducer: ImportDataProducer,
    private readonly sourcingDataImport: SourcingDataImportService,
  ) {}

  async loadXlsxFile(
    userId: string,
    xlsxFileData: Express.Multer.File,
  ): Promise<void> {
    try {
      await this.importDataProducer.addExcelImportJob(xlsxFileData, userId);
    } catch (error: any) {
      this.logger.error(
        `Job for file: ${
          xlsxFileData.filename
        } sent by user: ${userId} could not been added to queue: ${error.toString()}`,
      );
      /**
       * @note: This error would be sent back to the consumer in case the job hasn't been pushed to queue.
       * What would we want to add as message?
       */
      throw new ServiceUnavailableException(
        `File: ${xlsxFileData.filename} could not have been loaded`,
      );
    }
  }

  async processImportJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.sourcingDataImport.importSourcingData(
      job.data.xlsxFileData.path,
    );
  }
}
