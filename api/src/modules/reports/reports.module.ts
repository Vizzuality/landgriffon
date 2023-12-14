import { Module } from '@nestjs/common';
import { CSVReportService } from 'modules/reports/csv-report.service';

export const ReportServiceToken: string = 'IReportService';

@Module({
  providers: [{ provide: ReportServiceToken, useClass: CSVReportService }],
  exports: [ReportServiceToken],
})
export class ReportsModule {}
