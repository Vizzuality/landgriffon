import type { Orientation } from '@visx/axis';

type ChartData = Readonly<{
  x: string | number;
  y: string | number;
}>;

export type LinesConfig = Readonly<{
  width: string | number;
  strokeDasharray?: string;
  dataKey: string;
  data: ChartData[];
  className?: string;
}>;

type Grid = Readonly<{
  numTicks: number;
  columns: boolean;
}>;

type Axis = Readonly<{
  orientation: Orientation;
}>;

type ChartConfig = Readonly<{
  grid?: Grid;
  axis?: Axis;
  lines: LinesConfig[];
}>;

export type LineChartProps = Readonly<{
  chartConfig: ChartConfig;
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}>;
