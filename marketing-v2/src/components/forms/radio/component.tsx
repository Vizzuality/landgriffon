import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

const THEMES = {
  default:
    'border rounded-full text-sm text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 px-0',
};

type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  theme?: 'default';
  error?: string;
};

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, theme = 'default', error, children, ...props }, ref) => (
    <div className={classnames('mt-1', className)}>
      <div className="flex items-center">
        <input
          className={classnames([THEMES[theme]], {
            'border-red-600': !!error,
          })}
          {...props}
          ref={ref}
          type="checkbox"
        />
        <label htmlFor={props.id} className="ml-2 block text-sm text-gray-900">
          {children}
        </label>
      </div>
      {error && <Hint>{error}</Hint>}
    </div>
  ),
);

Radio.displayName = 'Radio';

export default Radio;
