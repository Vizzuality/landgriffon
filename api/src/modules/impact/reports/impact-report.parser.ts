import {
  AnyImpactTableRows,
  AnyImpactTableRowsValues,
  ImpactTableDataByIndicator,
  ImpactTableRowsValues,
} from 'modules/impact/dto/response-impact-table.dto';
import { GROUP_BY_VALUES } from 'modules/impact/dto/impact-table.dto';
import {
  ImpactTableCSVReport,
  ImpactTableToCSVInput,
} from 'modules/impact/reports/types';
import { Injectable } from '@nestjs/common';
import { ImpactReportDtoBuilder } from 'modules/impact/reports/impact-report-dto.builder';
import { ScenarioVsScenarioImpactTableRowsValues } from 'modules/impact/dto/response-scenario-scenario.dto';
import { ActualVsScenarioImpactTableRowsValues } from 'modules/impact/dto/response-actual-scenario.dto';

@Injectable()
export class ImpactReportDataParser {
  parseToCSVShape(data: ImpactTableToCSVInput[]): ImpactTableCSVReport[] {
    const results: ImpactTableCSVReport[] = [];

    data.forEach((indicator: ImpactTableToCSVInput) => {
      const unit: string = indicator.metadata.unit;
      indicator.rows.forEach((row: AnyImpactTableRows) => {
        this.parseNode(
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

  parseNode(
    node: AnyImpactTableRows,
    indicatorName:
      | Pick<ImpactTableDataByIndicator, 'indicatorShortName'>
      | string,
    groupBy: GROUP_BY_VALUES,
    unit: string,
    accumulator: ImpactTableCSVReport[],
    parentNodeName?: string | null,
  ): void {
    const reportDtoBuilder: ImpactReportDtoBuilder =
      new ImpactReportDtoBuilder();
    reportDtoBuilder.setIndicatorWithUnit(indicatorName, unit);
    reportDtoBuilder.setGroupingAndNodeName(groupBy, node.name, parentNodeName);
    node.values.forEach((valuesOfNode: AnyImpactTableRowsValues) => {
      reportDtoBuilder.setBaseYearKey(valuesOfNode.year);
      if (reportDtoBuilder.isYearProjected(valuesOfNode)) {
        reportDtoBuilder.setYearAsProjected();
      }
      if (reportDtoBuilder.isScenarioVsScenario(valuesOfNode)) {
        reportDtoBuilder.setScenarioVsScenarioValues(
          valuesOfNode as ScenarioVsScenarioImpactTableRowsValues,
        );
      }
      if (reportDtoBuilder.isActualVsScenario(valuesOfNode)) {
        reportDtoBuilder.setActualVsScenarioValues(
          valuesOfNode as ActualVsScenarioImpactTableRowsValues,
        );
      }
      if (reportDtoBuilder.isOnlyActualData(valuesOfNode)) {
        reportDtoBuilder.setActualDataValues(
          valuesOfNode as ImpactTableRowsValues,
        );
      }
    });
    accumulator.push(reportDtoBuilder.build());

    if (node.children && node.children.length) {
      const currentNodeName: string = reportDtoBuilder.getCurrentNodeName();
      node.children.forEach((children: AnyImpactTableRows) => {
        this.parseNode(
          children,
          indicatorName,
          groupBy,
          unit,
          accumulator,
          currentNodeName,
        );
      });
    }
  }
}
