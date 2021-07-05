import type { Story } from '@storybook/react';
import Breadcrumb, { BreadcrumbProps } from './component';

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  argTypes: {},
};

const Template: Story<BreadcrumbProps> = ({ pages }: BreadcrumbProps) => (
  <Breadcrumb pages={pages} />
);

export const Default = Template.bind({});

Default.args = {
  pages: [
    {
      current: false,
      href: '#',
      name: 'Analysis',
    },
    {
      current: true,
      href: '#',
      name: 'Scenarios',
    },
    {
      current: false,
      href: '#',
      name: 'Edit',
    },
  ],
};
