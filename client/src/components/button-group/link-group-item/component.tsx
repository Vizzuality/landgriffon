import Link from 'next/link';
import classNames from 'classnames';

import type { ComponentProps, HTMLAttributes } from 'react';

const CONTROL_ITEM_CLASS_NAMES =
  'relative ring-4 h-10 ring-inset ring-white inline-flex px-2.5 justify-center items-center border-l border-gray-200 leading-5 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 hover:bg-gray-100';
const CONTROL_ITEM_DEFAULT_CLASS_NAMES = 'bg-white text-sm text-gray-500';
const CONTROL_ITEM_ACTIVE_CLASS_NAMES = 'text-navy-400 bg-navy-400/10';

type LinkGroupItemProps = HTMLAttributes<HTMLAnchorElement> & {
  href: ComponentProps<typeof Link>['href'];
  active?: boolean;
};

const LinkGroupItem: React.FC<LinkGroupItemProps> = ({ children, active, href, ...props }) => (
  <Link
    href={href}
    className={classNames(
      CONTROL_ITEM_CLASS_NAMES,
      active ? CONTROL_ITEM_ACTIVE_CLASS_NAMES : CONTROL_ITEM_DEFAULT_CLASS_NAMES,
      'first:rounded-l-md first:border-l-0 last:rounded-r-md',
    )}
    {...props}
  >
    {children}
  </Link>
);

export default LinkGroupItem;
