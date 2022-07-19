import { Menu } from '@headlessui/react';

export const Dropdown: React.FC = ({ children, ...props }) => (
  <Menu as="div" className="relative inline-block text-left" {...props}>
    {children}
  </Menu>
);

export const Button: React.FC = ({ children, ...props }) => (
  <Menu.Button {...props}>{children}</Menu.Button>
);

export const Items: React.FC = ({ children, ...props }) => (
  <Menu.Items
    className="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
    {...props}
  >
    {children}
  </Menu.Items>
);

export const Item: React.FC = ({ children, ...props }) => (
  <Menu.Item>
    <div {...props}>{children}</div>
  </Menu.Item>
);

export default Object.assign(Dropdown, { Button, Items, Item });
