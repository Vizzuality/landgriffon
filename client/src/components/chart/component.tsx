import { ReactNode } from 'react';
import { ParentSize } from '@visx/responsive';
import AreaStacked from './area-stacked';

import MOCK from './mock';

export type ChartProps = {
  type: 'area-stacked';
  children: ReactNode;
};

const Chart: React.FC<ChartProps> = ({ type }: ChartProps) => (
  <ParentSize>
    {({ width, height }) => (
      <svg width={width} height={height}>
        {type === 'area-stacked' && (
          <AreaStacked
            data={MOCK}
            width={width}
            height={height}
            margin={{ top: 0, left: 0, bottom: 0, right: 0 }}
            keys={['beef', 'coal', 'corn', 'duck', 'mint', 'poultry', 'soy']}
          />
        )}
      </svg>
    )}
  </ParentSize>
);

export default Chart;
