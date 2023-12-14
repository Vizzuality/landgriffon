import { Inject, Injectable } from '@nestjs/common';
import { IReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';

export interface ErrorRecord {
  line: number;
  error: string;
}

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: IReportService,
  ) {}

  async createImportErrorReport(errors: ErrorRecord[]): Promise<string> {
    const parserOptions: { fields: ['line', 'error'] } = {
      fields: ['line', 'error'],
    };
    return this.reportService.generateReport(errors, parserOptions);
  }
}
