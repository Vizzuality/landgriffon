import type { FC } from 'react';
import { AnimatedLineSeries, XYChart, AnimatedAxis, AnimatedGrid } from '@visx/xychart';
import { ParentSize } from '@visx/responsive';

// types
import type { LineChartProps } from './types';

const LineChart: FC<LineChartProps> = ({
  width = 200,
  margin = {
    left: 5,
    top: 5,
    bottom: 5,
    right: 5,
  },
  chartConfig,
}) => {
  const { axis, grid, lines } = chartConfig;
  const accessors = {
    xAccessor: (d) => new Date(`${d?.x}T00:00:00`),
    yAccessor: (d) => d.y,
  };

  return (
    <ParentSize>
      {(parent) => (
        <XYChart
          height={parent.height}
          width={parent.width}
          margin={margin}
          xScale={{ type: 'time' }}
          yScale={{ type: 'linear' }}
        >
          {lines.map((line) => (
            <AnimatedLineSeries key={line.dataKey} width={width} {...line} {...accessors} />
          ))}
          {!!axis && <AnimatedAxis {...axis} />}
          {!!grid && <AnimatedGrid {...grid} />}
        </XYChart>
      )}
    </ParentSize>
  );
};

export default LineChart;
