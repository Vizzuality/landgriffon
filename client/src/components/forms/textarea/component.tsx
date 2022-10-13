import { forwardRef } from 'react';
import classnames from 'classnames';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

import Hint from '../hint';

import type { TextareaProps } from './types';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showHint = true, error, ...props }, ref) => (
    <>
      <div className={classnames('relative rounded-md shadow-sm', className)}>
        <textarea
          className={classnames(
            'block border w-full rounded-md text-sm focus:outline-none focus:ring-0 focus:border-navy-400 px-3',
            error ? 'border-red-400 pr-10' : 'border-gray-200',
            props.disabled ? 'text-gray-200' : 'text-gray-900',
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
          </div>
        )}
      </div>
      {error && showHint && <Hint>{error}</Hint>}
    </>
  ),
);

Textarea.displayName = 'Textarea';

export default Textarea;
