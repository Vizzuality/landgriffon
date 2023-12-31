import { Module } from '@nestjs/common';
import { ImpactReportDataParser } from 'modules/impact/reports/impact-report.parser';
import { ImpactReportService } from 'modules/impact/reports/impact.report';
import { ReportsModule } from 'modules/reports/reports.module';

@Module({
  imports: [ReportsModule],
  providers: [ImpactReportDataParser, ImpactReportService],
  exports: [ImpactReportService],
})
export class ImpactReportsModule {}
