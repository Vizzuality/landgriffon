import { Inject, Injectable } from '@nestjs/common';
import { ICSVReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';
import {
  ImpactTableDataByIndicator,
  ImpactTableRows,
} from 'modules/impact/dto/response-impact-table.dto';
import { ImpactTableCSVReport } from 'modules/impact/table-reports/types';
import { ParserOptions } from '@json2csv/plainjs';
import { GROUP_BY_VALUES } from 'modules/impact/dto/impact-table.dto';

@Injectable()
export class ImpactReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: ICSVReportService,
  ) {}

  async generateImpactReport(
    data: ImpactTableDataByIndicator[],
  ): Promise<string> {
    const parsedData: ImpactTableCSVReport[] = this.parseToCSVShape(data);
    const columnOrder: Pick<ParserOptions, 'fields'> = {
      fields: this.getColumnOrder(parsedData[0]),
    };

    return this.reportService.generateCSVReport(parsedData, columnOrder);
  }

  private parseToCSVShape(
    data: ImpactTableDataByIndicator[],
  ): ImpactTableCSVReport[] {
    const results: ImpactTableCSVReport[] = [];

    data.forEach((indicator: ImpactTableDataByIndicator) => {
      const unit: string = indicator.metadata.unit;
      indicator.rows.forEach((row: ImpactTableRows) => {
        this.processNode(
          row,
          indicator.indicatorShortName,
          indicator.groupBy,
          unit,
          results,
        );
      });
    });

    return results;
  }

  private processNode(
    node: ImpactTableRows,
    indicatorName:
      | Pick<ImpactTableDataByIndicator, 'indicatorShortName'>
      | string,
    groupBy: GROUP_BY_VALUES,
    unit: string,
    accumulator: ImpactTableCSVReport[],
  ): void {
    const groupName: string = `Group by ${groupBy}`;
    const targets: ImpactTableRows[] =
      node.children && node.children.length > 0 ? node.children : [node];

    targets.forEach((target: any) => {
      const resultObject: any = {
        [`Indicator`]: `${indicatorName} (${unit})`,
        [groupName]: target.name,
      };

      if (target.values && target.values.length > 0) {
        target.values.forEach((value: any) => {
          let yearKey: string = value.year.toString();
          if (value.isProjected) {
            yearKey = yearKey.concat(' (projected)');
          }
          resultObject[yearKey] = value.value;
        });

        accumulator.push(resultObject);
      }

      if (target.children && target.children.length > 0) {
        this.processNode(target, indicatorName, groupBy, unit, accumulator);
      }
    });
  }

  private getColumnOrder(dataSample: ImpactTableCSVReport): string[] {
    const indicatorKey: string[] = [];
    const groupByKey: string[] = [];
    const yearKeys: string[] = [];
    Object.keys(dataSample).forEach((key: string) => {
      if (key.includes('Indicator')) {
        groupByKey.push(key);
      } else if (key.includes('Group by')) {
        groupByKey.push(key);
      } else {
        yearKeys.push(key);
      }
    });
    return [...indicatorKey, ...groupByKey, ...yearKeys];
  }
}
