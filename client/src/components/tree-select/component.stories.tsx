import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import TreeSelect from './component';

import type { ComponentStory, ComponentMeta } from '@storybook/react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Tree Select',
  component: TreeSelect,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    theme: {
      options: ['default', 'inline-primary'],
      control: { type: 'radio' },
    },
    options: { table: { disable: true } },
    checkedStrategy: {
      options: ['ALL', 'CHILD', 'PARENT'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof TreeSelect>;

const queryClient = new QueryClient();

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TreeSelect> = (args) => {
  const [value, setValue] = useState(null);
  return (
    <QueryClientProvider client={queryClient}>
      <TreeSelect {...args} current={value} onChange={setValue} />
    </QueryClientProvider>
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  multiple: false,
  fitContent: false,
  placeholder: 'Select...',
  label: 'Label',
  options: [
    {
      value: 'deep',
      label: 'Deep',
      children: [
        { value: 'deeper', label: 'Deeper', children: [{ value: 'deepest', label: 'Deepest' }] },
      ],
    },
    {
      value: 'ocean',
      label: 'Ocean',
      color: '#00B8D9',
      isFixed: true,
      children: [
        { value: 'blue2', label: 'Blue2', color: '#0052CC', isDisabled: true },
        { value: 'purple2', label: 'Purple2', color: '#5243AA' },
        {
          value: 'red2',
          label: 'Red2',
          color: '#FF5630',
          isFixed: true,
          children: [
            { value: 'blue3', label: 'Blue3', color: '#0052CC' },
            { value: 'purple3', label: 'Purple3', color: '#5243AA' },
          ],
        },
      ],
    },
    { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
    { value: 'purple', label: 'Purple', color: '#5243AA' },
    { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
    { value: 'orange', label: 'Orange', color: '#FF8B00' },
    { value: 'yellow', label: 'Yellow', color: '#FFC400' },
    { value: 'green', label: 'Green', color: '#36B37E' },
    { value: 'forest', label: 'Forest', color: '#00875A' },
    { value: 'slate', label: 'Slate', color: '#253858' },
    { value: 'silver', label: 'Silver', color: '#666666' },
  ],
  loading: false,
  disabled: false,
  showSearch: false,
  theme: 'default',
  error: false,
};

export const Empty = Template.bind({});
Empty.args = { ...Default.args, options: [] };
