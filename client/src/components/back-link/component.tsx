import { forwardRef } from 'react';
import classNames from 'classnames';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import Link from 'next/link';

import type { AnchorHTMLAttributes, FC } from 'react';

const BackLink: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, className, href, ...props }, ref) => (
  <Link
    href={href}
    className={classNames('flex text-sm text-navy-400', className)}
    ref={ref}
    {...props}
  >
    <ArrowLeftIcon className="mr-4 inline-block h-5 w-5" />
    {children}
  </Link>
));

BackLink.displayName = 'BackLink';

export default BackLink;
