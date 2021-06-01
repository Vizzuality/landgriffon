import { FC, InputHTMLAttributes } from 'react';
import cx from 'classnames';
import useStatus from '../utils';

const THEME = {
  dark: {
    base:
      'bg-gray-800 border rounded-full text-blue-500',
    status: {
      none: 'border-gray-800',
      valid: 'border-green-800',
      error: 'border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
  },
  light: {
    base:
      'bg-white border rounded-full text-blue-500',
    status: {
      none: 'border-gray-800',
      valid: 'border-green-800',
      error: 'border-red-500 focus:border-red-500',
      disabled: 'border-gray-800 opacity-50',
    },
  },
};

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light';
  input?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export const Radio: FC<RadioProps> = ({
  theme = 'dark',
  disabled = false,
  input = {},
  meta = {},
  className,
  ...props
}: RadioProps) => {
  const st = useStatus({ active: !!input.checked, meta, disabled });

  return (
    <input
      {...input}
      {...props}
      type="radio"
      disabled={disabled}
      className={cx({
        'form-radio': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Radio;
