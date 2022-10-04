import { Button } from '.';
import type { ButtonProps, AnchorProps } from 'components/button/component';
import { PlusIcon } from '@heroicons/react/solid';
import { MailIcon } from '@heroicons/react/outline';

export default {
  title: 'Button',
  component: Button,
  argTypes: {
    theme: {
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'mail', 'add'],
      control: { type: 'select' },
    },
    size: {
      defaultValue: 'xl',
      options: ['xs', 'base', 'xl', 'text'],
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
  },
} as ButtonProps & AnchorProps;

const Template = (args: ButtonProps & AnchorProps) => {
  return (
    <div className="flex space-x-4">
      <Button {...args} />
      <Button {...args} disabled />
      <Button {...args} autoFocus />
    </div>
  );
};

export const Primary = Template.bind({});
export const Secondary = Template.bind({});
export const Mail = Template.bind({});
export const Add = Template.bind({});

Secondary.args = {
  theme: 'secondary',
};

Mail.args = {
  theme: 'secondary',
  icon: <MailIcon />,
};

Add.args = {
  icon: <PlusIcon />,
};
