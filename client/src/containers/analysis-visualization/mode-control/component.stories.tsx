import type { Story } from '@storybook/react';
import ModeControl from './component';

export default {
  title: 'Containers/ModeControl',
  component: ModeControl,
  argTypes: {},
};

const Template: Story = (props) => <ModeControl {...props} />;

export const Default = Template.bind({});

Default.args = {
  mode: 'map',
  query: {},
};
