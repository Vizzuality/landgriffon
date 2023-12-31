import { ImpactTableDataByIndicator } from 'modules/impact/dto/response-impact-table.dto';
import { ScenarioVsScenarioImpactTableDataByIndicator } from 'modules/impact/dto/response-scenario-scenario.dto';
import { ActualVsScenarioImpactTableDataByIndicator } from 'modules/impact/dto/response-actual-scenario.dto';

type YearData = {
  [key: string]: string | number;
};

type indicatorField = {
  Indicator: string;
};
type DynamicGroupByField = {
  [key: `Group by ${string}`]: string;
};

export type ImpactTableCSVReport = DynamicGroupByField &
  YearData &
  indicatorField;

export type ImpactTableToCSVInput =
  | ImpactTableDataByIndicator
  | ScenarioVsScenarioImpactTableDataByIndicator
  | ActualVsScenarioImpactTableDataByIndicator;
