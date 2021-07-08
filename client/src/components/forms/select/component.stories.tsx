import type { Story } from '@storybook/react';
import Select, { SelectProps } from './component';

export default {
  title: 'Components/Form/Select',
  component: Select,
  argTypes: {},
};

const Template: Story<SelectProps> = (props: SelectProps) => <Select {...props} />;

export const Default = Template.bind({});

Default.args = {
  options: [
    {
      label: 'Story 1',
      value: 'story-1',
    },
    {
      label: 'Story 2',
      value: 'story-2',
    },
    {
      label: 'Story 3',
      value: 'story-3',
    },
  ],
};
