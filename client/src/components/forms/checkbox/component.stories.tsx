import Component from '.';
import type { CheckboxProps } from './types';

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
};

const Template = (args: CheckboxProps) => {
  return (
    <Component
      {...args}
      error={args.error && 'This is an example of error message'}
      id="myCheckbox"
    >
      Lorem ipsum
    </Component>
  );
};

export const Checkbox = Template.bind({});
