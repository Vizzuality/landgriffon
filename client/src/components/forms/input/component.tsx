import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

const THEMES = {
  default:
    'appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-700 focus:border-green-700 sm:text-sm',
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  theme?: 'none' | 'default';
  type?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', theme = 'default', error, ...props }, ref) => (
    <>
      <div className={classnames('relative mt-1', className)}>
        <input
          className={classnames({
            [THEMES[theme]]: !!theme,
            'border-red-600': !!error,
          })}
          type={type}
          ref={ref}
          {...props}
        />
      </div>
      {error && <Hint>{error}</Hint>}
    </>
  ),
);

Input.displayName = 'Input';

export default Input;
