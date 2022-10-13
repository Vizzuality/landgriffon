import Component from '.';

import type { TextareaProps } from './types';

export default {
  title: 'Components/Forms',
  component: Component,
  argTypes: {
    showHint: {
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
} as TextareaProps;

const Template = (args: TextareaProps) => {
  return <Component {...args} error={args.error && 'This is an example of error message'} />;
};

export const Textarea = Template.bind({});
