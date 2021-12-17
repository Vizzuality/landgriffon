import { Injectable } from '@nestjs/common';
import { ImportDataProducer } from 'modules/import-data/workers/import-data.producer';

@Injectable()
export class ImportDataService {
  constructor(private readonly importDataProducer: ImportDataProducer) {}

  async loadXlsxFile(filePath: string): Promise<void> {
    await this.importDataProducer.addExcelImportJob(filePath);
  }
}
