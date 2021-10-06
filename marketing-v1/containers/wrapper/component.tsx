import React, { ReactNode } from 'react';

import cx from 'classnames';

export interface WrapperProps {
  children: ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({ children }: WrapperProps) => (
  <div
    className={cx({
      'md:container mx-auto px-3.5 md:px-12 w-full h-full flex flex-col flex-grow': true,
    })}
  >
    {children}
  </div>
);

export default Wrapper;
