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
            'block w-full rounded-md border px-4 text-sm focus:border-navy-400 focus:outline-none focus:ring-0',
            error ? 'border-red-400 pr-10' : 'border-gray-200',
            props.disabled ? 'text-gray-200' : 'text-gray-900',
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-4 w-4 text-red-400" />
          </div>
        )}
      </div>
      {error && showHint && <Hint>{error}</Hint>}
    </>
  ),
);

Textarea.displayName = 'Textarea';

export default Textarea;
