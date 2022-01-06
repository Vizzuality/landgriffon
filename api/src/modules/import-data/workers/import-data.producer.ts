import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { TinyTypeOf } from 'tiny-types';

export interface ExcelImportJob {
  xlsxFilePath: string;
  userId: string;
}

export class ImportQueueName extends TinyTypeOf<string>() {}

export const importQueueName: ImportQueueName = new ImportQueueName(
  'excel-import',
);

@Injectable()
export class ImportDataProducer {
  constructor(@InjectQueue(importQueueName.value) private importQueue: Queue) {}

  async addExcelImportJob(xlsxFilePath: string, userId: string): Promise<Job> {
    return this.importQueue.add('excel-import-job', {
      xlsxFilePath,
      userId,
    });
  }
}
