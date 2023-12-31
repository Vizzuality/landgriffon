import { Inject, Injectable } from '@nestjs/common';
import { ICSVReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';
import {
  ImpactTableCSVReport,
  ImpactTableToCSVInput,
} from 'modules/impact/reports/types';
import { ParserOptions } from '@json2csv/plainjs';
import { ImpactReportDataParser } from 'modules/impact/reports/impact-report.parser';

const IndicatorColumnKey: string = 'Indicator';
const GroupByColumnKey: string = 'Group by';
const AbsoluteDifferenceColumnKey: string = 'Absolute Difference';
const PercentageDifferenceColumnKey: string = 'Percentage Difference';

@Injectable()
export class ImpactReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: ICSVReportService,
    private dataParser: ImpactReportDataParser,
  ) {}

  async generateImpactReport(data: ImpactTableToCSVInput[]): Promise<string> {
    const parsedData: ImpactTableCSVReport[] =
      this.dataParser.parseToCSVShape(data);
    const columnOrder: Pick<ParserOptions, 'fields'> = {
      fields: this.getColumnOrder(parsedData),
    };

    return this.reportService.generateCSVReport(parsedData, columnOrder);
  }

  private getColumnOrder(
    parsedImpactTableData: ImpactTableCSVReport[],
  ): string[] {
    const dataSample: ImpactTableCSVReport = parsedImpactTableData[0];
    const indicatorKey: string[] = [];
    const groupByKey: string[] = [];
    const yearKeys: string[] = [];
    const comparisonKeys: string[] = [];
    Object.keys(dataSample).forEach((key: string) => {
      if (key.includes(IndicatorColumnKey)) {
        groupByKey.push(key);
      } else if (key.includes(GroupByColumnKey)) {
        groupByKey.push(key);
      } else if (key.includes(AbsoluteDifferenceColumnKey)) {
        comparisonKeys.push(key);
      } else if (key.includes(PercentageDifferenceColumnKey)) {
        comparisonKeys.push(key);
      } else {
        yearKeys.push(key);
      }
    });
    return [
      ...indicatorKey,
      ...groupByKey,
      ...yearKeys.sort(),
      ...comparisonKeys,
    ];
  }
}
