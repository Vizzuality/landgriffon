import Component from '.';
import type { RadioProps } from './types';

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
} as RadioProps;

const Template = (args: RadioProps) => {
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

export const Radio = Template.bind({});
