import { Menu } from '@headlessui/react';

export const Dropdown: React.FC<React.PropsWithChildren> = ({ children, ...props }) => (
  <Menu as="div" className="relative inline-block p-2 text-left" {...props}>
    {children}
  </Menu>
);

export const Button: React.FC<React.PropsWithChildren> = ({ children, ...props }) => (
  <Menu.Button {...props}>{children}</Menu.Button>
);

export const Items: React.FC<React.PropsWithChildren> = ({ children, ...props }) => (
  <Menu.Items
    className="absolute right-0 z-50 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    {...props}
  >
    {children}
  </Menu.Items>
);

export const Item: React.FC<React.PropsWithChildren> = ({ children, ...props }) => (
  <Menu.Item>
    <div {...props}>{children}</div>
  </Menu.Item>
);

export default Object.assign(Dropdown, { Button, Items, Item });
