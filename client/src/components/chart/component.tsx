import { ParentSize } from '@visx/responsive';
import { Children, cloneElement, isValidElement, ReactChild } from 'react';

export type ChartProps = {
  children: ReactChild | ReactChild[];
};

const Chart: React.FC<ChartProps> = ({ children }: ChartProps) => (
  <ParentSize>
    {({ width, height }) => (
      <svg width={width} height={height}>
        {Children.map(children, (Child) => {
          if (isValidElement(Child)) {
            return cloneElement(Child, {
              width,
              height,
            });
          }
          return null;
        })}
      </svg>
    )}
  </ParentSize>
);

export default Chart;
