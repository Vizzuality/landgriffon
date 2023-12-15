import { Inject, Injectable } from '@nestjs/common';
import { ICSVReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';

export interface ErrorRecord {
  line: number;
  error: string;
}

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: ICSVReportService,
  ) {}

  async createImportErrorReport(errors: ErrorRecord[]): Promise<string> {
    const parserOptions: { fields: ['line', 'error'] } = {
      fields: ['line', 'error'],
    };
    return this.reportService.generateCSVReport(errors, parserOptions);
  }
}
