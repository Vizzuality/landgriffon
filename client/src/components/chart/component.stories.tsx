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
    <Chart {...props}>
      <AreaStacked
        data={MOCK}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        keys={['beef', 'coal', 'corn', 'duck', 'mint', 'poultry', 'soy']}
      />
    </Chart>
  </div>
);

export const Default = Template.bind({});

Default.args = {
  type: 'area-stacked',
};
