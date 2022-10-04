import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

const THEMES = {
  default:
    'border rounded text-sm text-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 px-0',
};

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  theme?: 'default';
  error?: string;
  showHint?: boolean;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, theme = 'default', error, showHint = true, children, ...props }, ref) => (
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
      {error && showHint && <Hint>{error}</Hint>}
    </div>
  ),
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
