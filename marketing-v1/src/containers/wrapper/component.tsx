import React, { ReactNode } from 'react';

import cx from 'classnames';

export interface WrapperProps {
  className?: string;
  hasPadding?: boolean;
  children: ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({
  className,
  hasPadding = true,
  children,
}: WrapperProps) => (
  <div
    className={cx(
      'md:container px-3.5 xl:px-0 mx-auto w-full h-full',
      {
        'md:px-16 xl:px-16': hasPadding,
      },
      className
    )}
  >
    {children}
  </div>
);

export default Wrapper;
