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
      'flex justify-center items-center text-sm min-w-[2.5rem] h-10',
      className,
      {
        'border-b border-green-700': active,
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
