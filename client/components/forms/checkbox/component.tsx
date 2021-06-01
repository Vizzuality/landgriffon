import { FC, InputHTMLAttributes } from 'react';
import cx from 'classnames';
import useStatus from '../utils';

const THEME = {
  dark: {
    base:
      'bg-black border rounded-sm text-blue-500 focus:border-blue-500',
    status: {
      none: 'border-gray-500',
      valid: 'border-gray-500',
      error: 'border-red-500 focus:border-red-500',
      disabled: 'border-gray-500 opacity-50',
    },
  },
  light: {
    base:
      'bg-white border rounded-sm text-blue-500 focus:border-blue-500',
    status: {
      none: 'border-gray-800',
      valid: 'border-gray-800',
      error: 'border-red-500 focus:border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
  },
};

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light';
  input?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export const Checkbox: FC<CheckboxProps> = ({
  theme = 'dark',
  input,
  meta = {},
  disabled = false,
  className,
  ...props
}: CheckboxProps) => {
  const st = useStatus({ meta, disabled });

  return (
    <input
      {...input}
      {...props}
      type="checkbox"
      disabled={disabled}
      className={cx({
        'form-checkbox': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Checkbox;
