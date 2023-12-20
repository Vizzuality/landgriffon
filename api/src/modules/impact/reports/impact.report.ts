import { Inject, Injectable } from '@nestjs/common';
import { ICSVReportService } from 'modules/reports/report-service.interface';
import { ReportServiceToken } from 'modules/reports/reports.module';
import {
  AnyImpactTableRows,
  AnyImpactTableRowsValues,
  ImpactTableDataByIndicator,
} from 'modules/impact/dto/response-impact-table.dto';
import { ImpactTableCSVReport } from 'modules/impact/reports/types';
import { ParserOptions } from '@json2csv/plainjs';
import { GROUP_BY_VALUES } from 'modules/impact/dto/impact-table.dto';
import { ScenarioVsScenarioImpactTableDataByIndicator } from 'modules/impact/dto/response-scenario-scenario.dto';
import { ActualVsScenarioImpactTableDataByIndicator } from 'modules/impact/dto/response-actual-scenario.dto';

const IndicatorColumnKey: string = 'Indicator';
const GroupByColumnKey: string = 'Group by';
const AbsoluteDifferenceColumnKey: string = 'Absolute Difference';
const PercentageDifferenceColumnKey: string = 'Percentage Difference';

type ImpactTableToCSVInput =
  | ImpactTableDataByIndicator
  | ScenarioVsScenarioImpactTableDataByIndicator
  | ActualVsScenarioImpactTableDataByIndicator;

@Injectable()
export class ImpactReportService {
  constructor(
    @Inject(ReportServiceToken) private reportService: ICSVReportService,
  ) {}

  async generateImpactReport(data: ImpactTableToCSVInput[]): Promise<string> {
    const parsedData: ImpactTableCSVReport[] = this.parseToCSVShape(data);
    const columnOrder: Pick<ParserOptions, 'fields'> = {
      fields: this.getColumnOrder(parsedData[0]),
    };

    return this.reportService.generateCSVReport(parsedData, columnOrder);
  }

  private parseToCSVShape(
    data: ImpactTableToCSVInput[],
  ): ImpactTableCSVReport[] {
    const results: ImpactTableCSVReport[] = [];

    data.forEach((indicator: ImpactTableToCSVInput) => {
      const unit: string = indicator.metadata.unit;
      indicator.rows.forEach((row: AnyImpactTableRows) => {
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
    node: AnyImpactTableRows,
    indicatorName:
      | Pick<ImpactTableDataByIndicator, 'indicatorShortName'>
      | string,
    groupBy: GROUP_BY_VALUES,
    unit: string,
    accumulator: ImpactTableCSVReport[],
  ): void {
    const groupName: string = `${GroupByColumnKey} ${groupBy}`;
    const resultObject: ImpactTableCSVReport = {
      [`Indicator`]: `${indicatorName} (${unit})`,
      [groupName]: node.name,
    };
    node.values.forEach((nodeValue: AnyImpactTableRowsValues) => {
      let yearKey: string = nodeValue.year.toString();
      if (nodeValue.isProjected) {
        yearKey = yearKey.concat(' (projected)');
      }
      if ('baseScenarioValue' in nodeValue) {
        resultObject[`${yearKey} (Base Scenario)`] =
          nodeValue.baseScenarioValue;
        resultObject[`${yearKey} (Compared Scenario)`] =
          nodeValue.comparedScenarioValue;
      } else if ('comparedScenarioValue' in nodeValue) {
        resultObject[yearKey] = nodeValue.value;
        resultObject[`${yearKey} (Compared Scenario)`] =
          nodeValue.comparedScenarioValue;
      } else {
        resultObject[yearKey] = nodeValue.value;
      }
      if ('absoluteDifference' in nodeValue) {
        resultObject[AbsoluteDifferenceColumnKey] =
          nodeValue.absoluteDifference;
      }
      if ('percentageDifference' in nodeValue) {
        resultObject[PercentageDifferenceColumnKey] =
          nodeValue.percentageDifference;
      }
    });
    accumulator.push(resultObject);

    if (node.children && node.children.length) {
      node.children.forEach((children: AnyImpactTableRows) => {
        this.processNode(children, indicatorName, groupBy, unit, accumulator);
      });
    }
  }

  private getColumnOrder(dataSample: ImpactTableCSVReport): string[] {
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
