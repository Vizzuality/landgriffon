import { Button, Anchor } from '.';
import { PlusIcon } from '@heroicons/react/outline';
import type { ButtonProps, AnchorProps } from 'components/button/component';
import Link from 'next/link';

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
} as ButtonProps & AnchorProps;

const ButtonTemplate = (args: ButtonProps) => {
  return <Button {...args} icon={args.icon && <PlusIcon />} />;
};

const AnchorTemplate = (args: AnchorProps) => {
  return <Anchor href="#" {...args} icon={args.icon && <PlusIcon />} />;
};

const AnchorLinkTemplate = (args: AnchorProps) => {
  return (
    <Link href="#">
      <Anchor {...args} icon={args.icon && <PlusIcon />} />
    </Link>
  );
};

export const Basic = ButtonTemplate.bind({});

export const AnchorButton = AnchorTemplate.bind({});

export const AnchorLinkButton = AnchorLinkTemplate.bind({});
