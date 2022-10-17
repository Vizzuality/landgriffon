import { PlusIcon } from '@heroicons/react/outline';
import Link from 'next/link';

import { Button, Anchor } from '.';

import type { AnchorButtonProps } from 'components/button/component';

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
      description: 'Only for Button component',
    },
  },
};

const ButtonTemplate = (args: AnchorButtonProps) => {
  return (
    <div className="space-x-2">
      <Button {...args} icon={args.icon && <PlusIcon />} />
      <Anchor href="#" {...args} icon={args.icon && <PlusIcon />} />
      <Link href="#">
        <Anchor {...args} icon={args.icon && <PlusIcon />} />
      </Link>
    </div>
  );
};

export const Buttons = ButtonTemplate.bind({});
