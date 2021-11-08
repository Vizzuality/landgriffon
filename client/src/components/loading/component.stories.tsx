import type { Story } from '@storybook/react';
import Loading from './component';
import type { LoadingProps } from './types';

const StorybookModule = {
  title: 'Components/Loading',
  component: Loading,
};

const Template: Story<LoadingProps> = (args) => <Loading {...args} />;

export const Default = Template.bind({});
Default.args = {
  className: 'w-5 h-5 text-blue-500',
  visible: true,
};

export default StorybookModule;
