import { cloneElement, forwardRef } from 'react';
import classnames from 'classnames';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

import Hint from '../hint';

import type { InputProps } from './types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, type = 'text', unit, showHint = true, ...inputProps }, ref) => (
    <>
      <div className={classnames('relative rounded-md shadow-sm', className)}>
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {cloneElement(icon, {
              className: classnames('w-4 h-4 text-gray-500', icon.props?.className),
            })}
          </div>
        )}
        <input
          className={classnames(
            'block w-full px-4 py-2.5 leading-5 rounded-md bg-white text-sm border placeholder:text-gray-200 focus:outline-none focus:ring-0',
            error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-navy-400',
            inputProps.disabled ? 'opacity-50 text-gray-200' : 'text-gray-900',
            {
              'pl-8': icon,
              'pr-10': unit && !error,
              'pr-20': unit && error,
            },
          )}
          ref={ref}
          type={type}
          {...inputProps}
        />
        {unit && (
          <div
            className={classnames(
              'absolute inset-y-0 flex items-center pr-3 pointer-events-none',
              error ? 'right-6' : 'right-0',
            )}
          >
            <span className="text-gray-500 sm:text-sm">{unit}</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
          </div>
        )}
      </div>
      {showHint && error && typeof error === 'string' && (
        <Hint data-testid={`hint-input-${inputProps.name}`}>{error}</Hint>
      )}
    </>
  ),
);

Input.displayName = 'Input';

export default Input;
