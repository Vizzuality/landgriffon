import type { Story } from '@storybook/react';
import Chart, { ChartProps } from './component';

export default {
  title: 'Components/Chart',
  component: Chart,
  argTypes: {},
};

const Template: Story<ChartProps> = (props: ChartProps) => (
  <div className="w-full h-80">
    <Chart {...props} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  type: 'area-stacked',
};
