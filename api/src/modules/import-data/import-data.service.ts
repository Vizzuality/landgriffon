import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ImportDataProducer } from 'modules/import-data/workers/import-data.producer';
import { Job } from 'bull';
import { ExcelImportJob } from 'modules/import-data/workers/import-data.producer';
import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import { TasksService } from 'modules/tasks/tasks.service';
import { Task } from 'modules/tasks/task.entity';

@Injectable()
export class ImportDataService {
  logger: Logger = new Logger(ImportDataService.name);
  constructor(
    private readonly importDataProducer: ImportDataProducer,
    private readonly sourcingDataImportService: SourcingDataImportService,
    private readonly tasksService: TasksService,
  ) {}

  async ValidateAndLoadXlsxFile(
    userId: string,
    xlsxFileData: Express.Multer.File,
  ): Promise<Task> {
    const { filename, path } = xlsxFileData;
    await this.sourcingDataImportService.validateFile(path, filename);
    return await this.loadXlsxFile(userId, xlsxFileData);
  }

  async loadXlsxFile(
    userId: string,
    xlsxFileData: Express.Multer.File,
  ): Promise<Task> {
    const { filename, path } = xlsxFileData;
    const task: Task = await this.tasksService.createTask({
      data: { filename, path },
      userId,
    });
    try {
      await this.importDataProducer.addExcelImportJob(xlsxFileData, task.id);
      return task;
    } catch (error: any) {
      this.logger.error(
        `Job for file: ${
          xlsxFileData.filename
        } sent by user: ${userId} could not been added to queue: ${error.toString()}`,
      );

      await this.tasksService.remove(task.id);
      throw new ServiceUnavailableException(
        `File: ${xlsxFileData.filename} could not have been loaded. Please try again later or contact the administrator`,
      );
    }
  }

  async processImportJob(job: Job<ExcelImportJob>): Promise<void> {
    await this.sourcingDataImportService.importSourcingData(
      job.data.xlsxFileData.path,
    );
  }
}
