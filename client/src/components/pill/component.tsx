import classNames from 'classnames';

import type { PropsWithChildren } from 'react';

export interface PillProps {
  className?: string;
}

const Pill: React.FC<PropsWithChildren<PillProps>> = ({
  className,
  children,
}: PropsWithChildren<PillProps>) => (
  <span
    className={classNames('px-2 py-1 text-xs rounded', {
      [className]: !!className,
    })}
  >
    {children}
  </span>
);

export default Pill;
