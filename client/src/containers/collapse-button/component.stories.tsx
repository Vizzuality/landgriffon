import type { Story } from '@storybook/react';
import CollapseButton from './component';
import type { CollapseButtonProps } from './component';

export default {
  title: 'Containers/CollapseButton',
  component: CollapseButton,
  argTypes: {},
};

const Template: Story<CollapseButtonProps> = (props: CollapseButtonProps) => (
  <CollapseButton {...props} />
);

export const Default = Template.bind({});

Default.args = {
  active: false,
};
