import { Button } from '../components/button';
import { ButtonProps, AnchorProps } from 'components/button/component';

export default {
  title: 'Button',
  component: Button,
  argTypes: {
    theme: {
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'textLight'],
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

const Template = (args: ButtonProps & AnchorProps) => <Button {...args} />;

export const Default = Template.bind({});
export const Hover = Template.bind({});
export const Focus = Template.bind({});
export const Disabled = Template.bind({});


Hover.parameters = { pseudo: { hover: true } };
Focus.parameters = { pseudo: { focus: true } };
Disabled.args = { disabled: true};
