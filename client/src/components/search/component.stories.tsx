import { SearchIcon } from '@heroicons/react/solid';

import Component from '.';

import type { SearchProps } from './types';

export default {
  title: 'Components/Search',
  component: Component,
  argTypes: {
    showHint: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    icon: {
      defaultValue: true,
      control: { type: 'boolean' },
    },
    error: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
  },
};

const Template = (args: SearchProps) => {
  return (
    <Component
      {...args}
      placeholder="Search by term"
      icon={args.icon && <SearchIcon />}
      error={args.error && 'This is an example of error message'}
    />
  );
};

export const Search = Template.bind({});
