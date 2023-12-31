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
import { CsvDataBuilder } from 'modules/impact/reports/csv-data.builder';
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
    parentName?: string | null,
  ): void {
    const parsedDataBuilder: CsvDataBuilder = new CsvDataBuilder();
    parsedDataBuilder.setIndicatorWithUnit(indicatorName, unit);
    parsedDataBuilder.setGroupingAndNodeName(groupBy, node.name, parentName);
    node.values.forEach((valuesOfNode: AnyImpactTableRowsValues) => {
      parsedDataBuilder.setBaseYearKey(valuesOfNode.year);
      if (parsedDataBuilder.isYearProjected(valuesOfNode)) {
        parsedDataBuilder.setProjectedYear();
      }
      if (parsedDataBuilder.isScenarioVsScenario(valuesOfNode)) {
        parsedDataBuilder.setScenarioVsScenarioValues(
          valuesOfNode as ScenarioVsScenarioImpactTableRowsValues,
        );
      }
      if (parsedDataBuilder.isActualVsScenario(valuesOfNode)) {
        parsedDataBuilder.setActualVsScenarioValues(
          valuesOfNode as ActualVsScenarioImpactTableRowsValues,
        );
      }
      if (parsedDataBuilder.isOnlyActualData(valuesOfNode)) {
        parsedDataBuilder.setActualDataValues(
          valuesOfNode as ImpactTableRowsValues,
        );
      }
    });
    accumulator.push(parsedDataBuilder.build());

    if (node.children && node.children.length) {
      const currentNodeName: string = parsedDataBuilder.getCurrentNodeName();
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
