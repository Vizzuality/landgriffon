import type { Story } from '@storybook/react';

import Chart, { ChartProps } from './component';
import AreaStacked from './area-stacked';

import MOCK from './mock';

export default {
  title: 'Components/Chart',
  component: Chart,
  argTypes: {},
};

const Template: Story<ChartProps> = (props: ChartProps) => (
  <div className="w-full h-96">
    <Chart>
      <AreaStacked
        data={MOCK}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        keys={['beef', 'coal', 'corn', 'duck', 'mint', 'poultry', 'soy']}
        target={120}
        {...props}
      />
    </Chart>
  </div>
);

export const AreaStackedChart = Template.bind({});
AreaStackedChart.args = {
  settings: {
    tooltip: false,
    projection: false,
    target: false,
  },
};

export const AreaStackedChartWithTooltip = Template.bind({});
AreaStackedChartWithTooltip.args = {
  settings: {
    tooltip: true,
    projection: false,
    target: false,
  },
};

export const AreaStackedChartWithProjection = Template.bind({});
AreaStackedChartWithProjection.args = {
  settings: {
    tooltip: true,
    projection: true,
    target: false,
  },
};

export const AreaStackedChartWithTarget = Template.bind({});
AreaStackedChartWithTarget.args = {
  settings: {
    tooltip: true,
    projection: true,
    target: true,
  },
};
