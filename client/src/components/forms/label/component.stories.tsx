import { Story } from '@storybook/react';
import Label, { LabelProps } from './component';

export default {
  title: 'Components/Forms/Label',
  component: Label,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark', 'light'],
      },
    },
  },
};

const Template: Story<LabelProps> = ({ ...args }) => <Label {...args}>This is a test</Label>;

export const Default = Template.bind({});
Default.args = {
  id: 'scenario',
  theme: 'dark',
  className: 'uppercase',
};
