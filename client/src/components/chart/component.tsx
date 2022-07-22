import { ParentSize } from '@visx/responsive';
import type { ReactChild } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

export type ChartProps = {
  children: ReactChild | ReactChild[];
};

const Chart: React.FC<ChartProps> = ({ children }: ChartProps) => (
  <ParentSize>
    {({ width, height }) =>
      Children.map(children, (Child) => {
        if (isValidElement(Child)) {
          return cloneElement(Child, {
            width,
            height,
          });
        }
        return null;
      })
    }
  </ParentSize>
);

export default Chart;
