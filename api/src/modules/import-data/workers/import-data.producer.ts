import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';

export interface ExcelImportJob {
  xlsxFileData: Express.Multer.File;
  taskId: string;
}

export interface EudrImportJob {
  xlsxFileData: Express.Multer.File;
  taskId: string;
}

@Injectable()
export class ImportDataProducer {
  constructor(
    @InjectQueue(importQueueName) private readonly importQueue: Queue,
    @InjectQueue('eudr') private readonly eudrQueue: Queue,
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

  async addEudrImportJob(
    xlsxFileData: Express.Multer.File,
    taskId: string,
  ): Promise<void> {
    await this.eudrQueue.add('eudr', {
      xlsxFileData,
      taskId,
    });
  }
}
