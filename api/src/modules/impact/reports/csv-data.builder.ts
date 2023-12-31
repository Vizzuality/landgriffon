import {
  AnyImpactTableRowsValues,
  ImpactTableDataByIndicator,
  ImpactTableRowsValues,
} from 'modules/impact/dto/response-impact-table.dto';
import { ScenarioVsScenarioImpactTableRowsValues } from 'modules/impact/dto/response-scenario-scenario.dto';
import { ActualVsScenarioImpactTableRowsValues } from 'modules/impact/dto/response-actual-scenario.dto';
import { ImpactTableCSVReport } from 'modules/impact/reports/types';

/**
 * @description Handles the building of the object, for each row that it will be parsed to CSV
 */

export class CsvDataBuilder {
  csvData: ImpactTableCSVReport;
  currentNodeName: string;
  yearKey: string;
  valuesForEachYearMap: Record<string, number> = {};

  constructor() {
    this.csvData = {} as ImpactTableCSVReport;
  }

  setIndicatorWithUnit(
    indicatorName:
      | Pick<ImpactTableDataByIndicator, 'indicatorShortName'>
      | string,
    unit: string,
  ): void {
    this.csvData.Indicator = `${indicatorName} (${unit})`;
  }

  setGroupingAndNodeName(
    groupingBy: string,
    currentNodeName: string,
    parentNodeName?: string | null,
  ): void {
    let concatenatedName: string;
    if (parentNodeName) {
      concatenatedName = `${parentNodeName}.${currentNodeName}`;
    } else {
      concatenatedName = currentNodeName;
    }
    this.csvData[`Group by ${groupingBy}`] = concatenatedName;
    this.currentNodeName = concatenatedName;
  }

  getCurrentNodeName(): string {
    if (!this.currentNodeName) throw new Error('Current node name is not set');
    return this.currentNodeName;
  }

  isYearProjected(valuesOfNode: AnyImpactTableRowsValues): boolean {
    return valuesOfNode.isProjected;
  }

  isScenarioVsScenario(valuesOfNode: AnyImpactTableRowsValues): boolean {
    return (
      valuesOfNode.hasOwnProperty('baseScenarioValue') &&
      valuesOfNode.hasOwnProperty('comparedScenarioValue')
    );
  }

  isActualVsScenario(valuesOfNode: AnyImpactTableRowsValues): boolean {
    return (
      valuesOfNode.hasOwnProperty('comparedScenarioValue') &&
      !valuesOfNode.hasOwnProperty('baseScenarioValue')
    );
  }

  setBaseYearKey(year: number): void {
    this.yearKey = year.toString();
  }

  setProjectedYear(): void {
    this.yearKey = this.yearKey.concat(' (projected)');
  }

  isOnlyActualData(valuesOfNode: AnyImpactTableRowsValues): boolean {
    return (
      !valuesOfNode.hasOwnProperty('baseScenarioValue') &&
      !valuesOfNode.hasOwnProperty('comparedScenarioValue')
    );
  }

  setActualDataValues(valuesOfNode: ImpactTableRowsValues): void {
    this.valuesForEachYearMap[this.yearKey] = valuesOfNode.value;
  }

  setScenarioVsScenarioValues(
    valuesOfNode: ScenarioVsScenarioImpactTableRowsValues,
  ): void {
    this.valuesForEachYearMap[`${this.yearKey} (Base Scenario)`] =
      valuesOfNode.baseScenarioValue;
    this.valuesForEachYearMap[`${this.yearKey} (Compared Scenario)`] =
      valuesOfNode.comparedScenarioValue;
    this.valuesForEachYearMap[`${this.yearKey} (Absolute Difference)`] =
      valuesOfNode.absoluteDifference;
    this.valuesForEachYearMap[`${this.yearKey} (Percentage Difference)`] =
      valuesOfNode.percentageDifference;
  }

  setActualVsScenarioValues(
    valuesOfNode: ActualVsScenarioImpactTableRowsValues,
  ): void {
    this.valuesForEachYearMap[this.yearKey] = valuesOfNode.value;
    this.valuesForEachYearMap[`${this.yearKey} (Compared Scenario)`] =
      valuesOfNode.comparedScenarioValue;
    this.valuesForEachYearMap[`${this.yearKey} (Absolute Difference)`] =
      valuesOfNode.absoluteDifference;
    this.valuesForEachYearMap[`${this.yearKey} (Percentage Difference)`] =
      valuesOfNode.percentageDifference;
  }

  build(): ImpactTableCSVReport {
    this.csvData = Object.assign(this.csvData, this.valuesForEachYearMap);
    this.valuesForEachYearMap = {};
    this.yearKey = '';
    return this.csvData;
  }
}
