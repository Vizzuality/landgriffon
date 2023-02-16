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
    className={classNames('flex text-navy-400 text-sm', className)}
    ref={ref}
    {...props}
  >
    <ArrowLeftIcon className="inline-block w-5 h-5 mr-4" />
    {children}
  </Link>
));

BackLink.displayName = 'BackLink';

export default BackLink;
