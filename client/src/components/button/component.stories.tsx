import { Button } from '.';
import type { ButtonProps, AnchorProps } from 'components/button/component';
import { PlusIcon } from '@heroicons/react/outline';

export default {
  title: 'Components/Buttons',
  component: Button,
  argTypes: {
    variant: {
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'white'],
      control: { type: 'radio' },
    },
    size: {
      defaultValue: 'base',
      options: ['xs', 'base', 'xl'],
      control: { type: 'radio' },
    },
    children: {
      defaultValue: 'Button text',
      control: { type: 'text' },
    },
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    danger: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    icon: {
      defaultValue: null,
      control: { type: 'boolean' },
    },
    loading: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
  },
} as ButtonProps & AnchorProps;

const Template = (args: ButtonProps & AnchorProps) => {
  return <Button {...args} icon={args.icon && <PlusIcon />} />;
};

export const Basic = Template.bind({});

Basic.args = {
  variant: 'primary',
  size: 'base',
};
