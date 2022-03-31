import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { TinyTypeOf } from 'tiny-types';
import * as config from 'config';

export interface ExcelImportJob {
  xlsxFileData: Express.Multer.File;
  taskId: string;
}

export class ImportQueueName extends TinyTypeOf<string>() {}

const importQueueName: string = config.get('redis.importQueueName');

@Injectable()
export class ImportDataProducer {
  constructor(
    @InjectQueue(importQueueName) private readonly importQueue: Queue,
  ) {}

  async addExcelImportJob(
    xlsxFileData: Express.Multer.File,
    taskId: string,
  ): Promise<void> {
    await this.importQueue.add('excel-import-job', {
      xlsxFileData,
      taskId,
    });
  }
}
