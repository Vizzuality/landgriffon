import { Module } from '@nestjs/common';
import { CSVReportService } from 'modules/reports/csv-report.service';

export const IReportService: string = 'IReportService';

@Module({
  providers: [{ provide: IReportService, useClass: CSVReportService }],
  exports: [IReportService],
})
export class ReportsModule {}
