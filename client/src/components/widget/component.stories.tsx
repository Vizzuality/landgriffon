import type { Story } from '@storybook/react';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';

import Widget, { WidgetProps } from './component';

import MOCK from './mock';

const StorybookModule = {
  title: 'Components/Widget',
  component: Widget,
  argTypes: {},
};

const Template: Story<WidgetProps> = (props: WidgetProps) => (
  <div className="w-full h-96">
    <Widget {...props}>
      <Chart>
        <AreaStacked
          title="Carbon emissions"
          data={MOCK}
          margin={{ top: 12, right: 12, bottom: 30, left: 30 }}
          keys={['beef', 'coal', 'corn', 'duck', 'mint', 'poultry', 'soy']}
          target={120}
          settings={{
            tooltip: true,
            projection: true,
            target: true,
          }}
        />
      </Chart>
    </Widget>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Carbon emissions (CO2e)',
};

export default StorybookModule;
