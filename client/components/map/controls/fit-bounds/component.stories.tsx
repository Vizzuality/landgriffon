import { Story } from '@storybook/react/types-6-0';
import FitBoundsControl, { FitBoundsControlProps } from './component';

export default {
  title: 'Components/Map/Controls/FitBounds',
  component: FitBoundsControl,
};

const Template: Story<FitBoundsControlProps> = (args) => (
  <FitBoundsControl
    {...args}
    onFitBoundsChange={(bounds) => {
      console.info('onFitBoundsChange: ', bounds);
    }}
  />
);

export const Default = Template.bind({});
Default.args = {
  className: '',
  bounds: {
    bbox: [
      10.5194091796875,
      43.6499881760459,
      10.9588623046875,
      44.01257086123085,
    ],
    options: {},
    viewportOptions: {
      transitionDuration: 0,
    },
  },
  onFitBoundsChange: (bounds) => {
    console.info(bounds);
  },
};
