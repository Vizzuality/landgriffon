import type { Story } from '@storybook/react';
import DOWNLOAD_SVG from 'assets/ui/download.svg';
import Icon from './component';
import type { IconProps } from './component';

export default {
  title: 'Components/Icon',
  component: Icon,
};

const Template: Story<IconProps> = (args) => <Icon {...args} />;

export const Default = Template.bind({});
Default.args = {
  className: 'w-5 h-5 text-blue-500',
  icon: DOWNLOAD_SVG,
};
