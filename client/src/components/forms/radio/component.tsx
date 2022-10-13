import React from 'react';
import classnames from 'classnames';
import Hint from '../hint';

import type { RadioProps } from './types';

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, error, showHint, children, ...props }, ref) => (
    <div className={classnames('mt-1', className)}>
      <div className="flex items-center">
        <input
          className={classnames(
            'border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-navy-400/20 focus:border-navy-400 px-0',
            props.disabled ? 'border-gray-300' : 'border-navy-400',
            !props.disabled && error ? 'border-red-400' : 'border-gray-300',
          )}
          {...props}
          ref={ref}
          type="checkbox"
        />
        <label
          htmlFor={props.id}
          className={classnames(
            'block ml-2 text-sm',
            props.disabled ? 'text-gray-300' : 'text-gray-900',
          )}
        >
          {children}
        </label>
      </div>
      {error && showHint && <Hint>{error}</Hint>}
    </div>
  ),
);

Radio.displayName = 'Radio';

export default Radio;
