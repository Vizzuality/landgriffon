import Link from 'next/link';
import classNames from 'classnames';

import type { ComponentProps, HTMLAttributes } from 'react';

const CONTROL_ITEM_CLASS_NAMES =
  'relative inline-flex px-2.5 py-2.5 justify-center items-center border-l border-gray-200 leading-5 ring-4 ring-inset ring-white hover:cursor-pointer hover:bg-navy-400/20 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy-400/20 max-h-[40px]';
const CONTROL_ITEM_DEFAULT_CLASS_NAMES = 'bg-white text-sm text-gray-500';
const CONTROL_ITEM_ACTIVE_CLASS_NAMES = 'text-navy-400 bg-navy-400/20';

type LinkGroupItemProps = HTMLAttributes<HTMLAnchorElement> & {
  href: ComponentProps<typeof Link>['href'];
  active?: boolean;
};

const LinkGroupItem: React.FC<LinkGroupItemProps> = ({ children, active, href, ...props }) => (
  <Link href={href}>
    <a
      className={classNames(
        CONTROL_ITEM_CLASS_NAMES,
        active ? CONTROL_ITEM_ACTIVE_CLASS_NAMES : CONTROL_ITEM_DEFAULT_CLASS_NAMES,
        'first:rounded-l-md first:border-l-0 last:rounded-r-md',
      )}
      {...props}
    >
      {children}
    </a>
  </Link>
);

export default LinkGroupItem;
