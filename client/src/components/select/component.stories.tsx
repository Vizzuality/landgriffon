import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Select from './component';
import { SelectProps } from '.';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Select',
  component: Select,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    theme: {
      options: ['default', 'default-bordernone', 'inline-primary'],
      control: { type: 'radio' },
    },
    options: { table: { disable: true } },
  },
} as ComponentMeta<typeof Select>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Select> = (args) => {
  const [value, setValue] = useState(null);
  return <Select {...args} current={value} onChange={setValue} />;
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  options: [
    { value: 'ocean', label: 'Ocean' },
    { value: 'purple', label: 'Purple' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'blue', label: 'Disabled', disabled: true },
    { value: 'yellow', label: 'Yellow' },
    { value: 'green', label: 'Green' },
    { value: 'forest', label: 'Forest' },
    { value: 'slate', label: 'Slate' },
    { value: 'silver', label: 'Silver' },
  ],
  placeholder: 'placeholder',
  label: 'The label',
  loading: false,
  disabled: false,
  showSearch: false,
  theme: 'default',
  error: false,
  hideValueWhenMenuOpen: false,
} as Partial<SelectProps>;

export const Empty = Template.bind({});
Empty.args = { ...Default.args, options: [] };
