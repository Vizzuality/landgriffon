import type { Story } from '@storybook/react';
import ModeControl from './component';
import type { ModeControlProps } from './component';

export default {
  title: 'Containers/ModeControl',
  component: ModeControl,
  argTypes: {},
};

const Template: Story<ModeControlProps> = (props: ModeControlProps) => <ModeControl {...props} />;

export const Default = Template.bind({});

Default.args = {
  mode: 'map',
  query: {},
};
