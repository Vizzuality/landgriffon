import { Inject, Injectable } from '@nestjs/common';
import { ICSVReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';
import { ImportTaskError } from './types/import-task-error.type';

export interface ErrorRecord {
  line: number;
  error: string;
}

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: ICSVReportService,
  ) {}

  async createImportErrorReport(errors: ImportTaskError[]): Promise<string> {
    const parserOptions: {
      fields: ['row', 'error', 'column', 'sheet', 'type'];
    } = {
      fields: ['row', 'error', 'column', 'sheet', 'type'],
    };
    return this.reportService.generateCSVReport(errors, parserOptions);
  }
}
