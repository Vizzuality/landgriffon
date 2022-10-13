import Component from '.';
import { PlusIcon } from '@heroicons/react/solid';
import type { InputProps } from './types';

export default {
  title: 'Components/Forms',
  component: Component,
  argTypes: {
    showHint: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    unit: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    icon: {
      defaultValue: false,
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
} as InputProps;

const Template = (args: InputProps) => {
  return (
    <Component
      {...args}
      icon={args.icon && <PlusIcon />}
      unit={args.unit && 'tCO2'}
      error={args.error && 'This is an example of error message'}
    />
  );
};

export const Input = Template.bind({});
