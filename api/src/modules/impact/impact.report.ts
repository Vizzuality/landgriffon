import { Inject, Injectable } from '@nestjs/common';
import { IReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';

@Injectable()
export class ImpactReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: IReportService,
  ) {}

  async generateImpactReport(data: any): Promise<string> {
    const parserOptions: { fields: ['line', 'error'] } = {
      fields: ['line', 'error'],
    };
    return this.reportService.generateReport(data, {});
  }
}
