import { FC, TextareaHTMLAttributes } from 'react';
import cx from 'classnames';
import useStatus from '../utils';

const THEME = {
  dark: {
    base: 'leading-tight text-white bg-transparent border rounded',
    status: {
      none: 'border-gray-500',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-700 opacity-50',
    },
  },
  light: {
    base: 'leading-tight text-gray-800 bg-white border rounded',
    status: {
      none: 'border-gray-500',
      valid: 'border-green-500',
      error: 'border-red-500',
      disabled: 'border-gray-700 opacity-50',
    },
  },
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  theme?: 'dark' | 'light';
  input?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export const Textarea: FC<TextareaProps> = ({
  theme = 'dark',
  disabled = false,
  meta = {},
  input,
  className,
  ...props
}: TextareaProps) => {
  const st = useStatus({ meta, disabled });

  return (
    <textarea
      {...input}
      {...props}
      disabled={disabled}
      className={cx({
        'form-textarea w-full': true,
        [THEME[theme].base]: true,
        [THEME[theme].status[st]]: true,
        [className]: !!className,
      })}
    />
  );
};

export default Textarea;
