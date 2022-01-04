import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { TinyTypeOf } from 'tiny-types';

export interface ExcelImportJob {
  xlsxFileData: Express.Multer.File;
  userId: string;
}

export class ImportQueueName extends TinyTypeOf<string>() {}

export const importQueueName: ImportQueueName = new ImportQueueName(
  'excel-import',
);

@Injectable()
export class ImportDataProducer {
  constructor(
    @InjectQueue(importQueueName.value) private readonly importQueue: Queue,
  ) {}

  async addExcelImportJob(
    xlsxFileData: Express.Multer.File,
    userId: string,
  ): Promise<void> {
    await this.importQueue.add('excel-import-job', {
      xlsxFileData,
      userId,
    });
  }
}
