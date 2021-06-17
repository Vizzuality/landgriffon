import { Story } from '@storybook/react/types-6-0';
import Avatar, { AvatarProps } from './component';

export default {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {},
};

const Template: Story<AvatarProps> = ({ src }: AvatarProps) => <Avatar src={src} />;

export const Default = Template.bind({});

Default.args = {
  // children: <Icon icon={HELP_SVG} className="w-5 h-5" />,
  src: '/images/avatar.png',
};
