import classNames from 'classnames';

import type { ButtonProps } from './types';

const Table: React.FC<ButtonProps> = ({
  className,
  active = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) => (
  <div
    className={classNames(
      'flex h-10 min-w-[2.5rem] items-center justify-center text-sm',
      className,
      {
        'border-green-700 border-b': active,
        'cursor-pointer': !disabled,
        'opacity-30': disabled,
      },
    )}
    {...props}
  >
    {children}
  </div>
);

export default Table;
