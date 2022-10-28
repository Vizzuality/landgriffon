import classNames from 'classnames';

import type { PropsWithChildren } from 'react';

export type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
};

const Pill: React.FC<PillProps> = ({
  className,
  children,
  ...props
}: PropsWithChildren<PillProps>) => (
  <span
    {...props}
    className={classNames('px-2 py-1 text-xs rounded', {
      [className]: !!className,
    })}
  >
    {children}
  </span>
);

export default Pill;
