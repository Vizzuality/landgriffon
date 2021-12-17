import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ImportDataProducer {
  constructor(@InjectQueue('excel-import') private importQueue: Queue) {}

  async addExcelImportJob(xlsxFilePath: string): Promise<void> {
    await this.importQueue.add('excel-import-job', {
      xlsxFilePath,
    });
  }
}
