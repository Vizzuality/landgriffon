export type ResultChartData = {
  year: number;
  value: number;
  comparedScenarioValue: number;
  projectedValue: number;
  comparedScenarioValueProjected: number;
};

export type ChartData = {
  year: number;
  value: number;
  comparedScenarioValue: number;
  isProjected: boolean;
};

export type ChartCellProps = {
  data: ChartData[];
};
