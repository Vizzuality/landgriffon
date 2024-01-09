import { forwardRef } from 'react';
import classnames from 'classnames';

import Hint from '../hint';

import type { CheckboxProps } from './types';

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, showHint = true, children, ...props }, ref) => (
    <div className={className}>
      <div className="flex items-center">
        <input
          className={classnames(
            'rounded border px-0 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-400/20',
            props.disabled ? 'border-gray-200' : 'border-navy-400',
            !props.disabled && error ? 'border-red-400' : 'border-gray-200',
          )}
          {...props}
          ref={ref}
          type="checkbox"
        />
        <label
          htmlFor={props.id}
          className={classnames(
            'ml-2 block text-sm',
            props.disabled ? 'text-gray-200' : 'text-gray-900',
          )}
        >
          {children}
        </label>
      </div>
      {error && showHint && <Hint>{error}</Hint>}
    </div>
  ),
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
