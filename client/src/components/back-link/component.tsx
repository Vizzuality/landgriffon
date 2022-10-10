import type { AnchorHTMLAttributes, FC } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { ArrowLeftIcon } from '@heroicons/react/solid';

const BackLink: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, className, href, ...props }, ref) => (
  <a
    href={href}
    className={classNames('flex text-navy-400 text-sm', className)}
    ref={ref}
    {...props}
  >
    <ArrowLeftIcon className="inline-block h-5 w-5 mr-4" />
    {children}
  </a>
));

BackLink.displayName = 'BackLink';

export default BackLink;
