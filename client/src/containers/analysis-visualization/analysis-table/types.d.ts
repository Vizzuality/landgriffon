/**
 * Depending on the mode, the API response will have different parameters:
 * - `false`: no comparison
 * - `true`: comparison of actual data against a scenario
 * - `'scenario'`: comparison of two scenarios
 */
export type ComparisonMode = boolean | 'scenario';

interface CommonValueItemProps {
  name: string;
  year: number;
  children?: this;
}

interface CommonComparisonValueItemProps extends CommonValueItemProps {
  absoluteDifference: number;
  percentageDifference: number;
  isProjected: boolean;
}

interface PlainValueItemProps extends CommonValueItemProps {
  value: number;
}

interface ComparisonValueItemProps extends CommonComparisonValueItemProps, PlainValueItemProps {
  scenarioValue: number;
}

interface ScenarioComparisonValueItemProps extends CommonComparisonValueItemProps {
  scenarioOneValue: number;
  scenarioTwoValue: number;
}

export type ImpactRowType<
  Comparison extends TableComparisonMode,
  IsParent extends boolean = false,
> = IsParent extends true
  ? ImpactTableData<Comparison>
  : {
      children?: this[];
      name: string;
      values: ImpactTableValueItem<Comparison>[];
    };

export type ImpactTableValueItem<Comparison extends TableComparisonMode> = Comparison extends false
  ? PlainValueItemProps
  : Comparison extends 'scenario'
  ? ScenarioComparisonValueItemProps
  : ComparisonValueItemProps;

export interface ImpactTableData<Comparison extends TableComparisonMode> {
  groupBy: string;
  indicatorId: Indicator['id'];
  indicatorShortName: string;
  metadata: Metadata;
  rows: ImpactRowType<Comparison>[];
  yearSum: ImpactTableValueItem<Comparison>[];
}

export type PurchasedTonnesData = {
  year: number;
  value: number;
  isProjected: boolean;
};
