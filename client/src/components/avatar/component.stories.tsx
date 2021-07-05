import type { Story } from '@storybook/react';
import Avatar, { AvatarProps } from './component';

export default {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {},
};

const Template: Story<AvatarProps> = ({ src }: AvatarProps) => <Avatar src={src} />;

export const Default = Template.bind({});

Default.args = {
  src: '/images/avatar.png',
};
