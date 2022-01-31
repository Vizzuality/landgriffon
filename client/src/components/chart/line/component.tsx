import { FC } from 'react';
import { AnimatedLineSeries, XYChart, AnimatedAxis, AnimatedGrid } from '@visx/xychart';
import { Orientation } from '@visx/axis';

type ChartData = Readonly<{
  x: string | number;
  y: string | number;
}>;

type LinesConfig = Readonly<{
  stroke: string;
  width: string | number;
  strokeDasharray?: string;
  dataKey: string;
  data: ChartData[];
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

const LineChart: FC<LineChartProps> = ({
  width = 200,
  height = 50,
  margin = {
    left: 5,
    top: 5,
    bottom: 5,
    right: 5,
  },
  chartConfig,
}: LineChartProps) => {
  const { axis, grid, lines } = chartConfig;
  const accessors = {
    xAccessor: (d) => new Date(`${d.x}T00:00:00`),
    yAccessor: (d) => d.y,
  };

  return (
    <XYChart
      height={height}
      width={width}
      margin={margin}
      xScale={{ type: 'time' }}
      yScale={{ type: 'linear' }}
    >
      {lines.map((line) => (
        <AnimatedLineSeries
          key={line.dataKey}
          width={width}
          height={height}
          {...line}
          {...accessors}
        />
      ))}
      {!!axis && <AnimatedAxis {...axis} />}
      {!!grid && <AnimatedGrid {...grid} />}
    </XYChart>
  );
};

export default LineChart;
