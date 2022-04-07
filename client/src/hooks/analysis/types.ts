import type { InterventionTypes } from 'containers/scenarios/types';

export interface AnalysisChartOptions {
  filters: Record<string, unknown>;
}

export interface AnalysisTableOptions {
  filters: Record<string, unknown>;
}

type ColorsChart = Readonly<{
  [key: string]: string;
}>;

type Indicator = Readonly<{
  label: string;
  value: string;
}>;

type Filters = Readonly<{
  by: string;
  endYear: number;
  indicator: Indicator;
  materials: unknown[];
  origins: unknown[];
  startYear: number;
  suppliers: unknown[];
}>;

type ChartValues = Readonly<{
  [key: string]: number | string | boolean;
  current: boolean;
  date: string;
  id: string;
}>;

type ChartData = Readonly<{
  colors: ColorsChart;
  filters: Filters;
  id: string;
  indicator: string;
  keys: string[];
  values: ChartValues[];
}>;

type ChartLegend = Readonly<{
  id: string;
  name: string;
  color: string;
}>;

export interface AnalysisChart {
  isLoading: boolean;
  isFetching: boolean;
  legend: ChartLegend[];
  data: ChartData[];
}

export type Intervention = Readonly<{
  slug: string;
  title: string;
  value: InterventionTypes;
  description: string;
}>;
