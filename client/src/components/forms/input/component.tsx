import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ error, ...props }, ref) => (
  <>
    <div className="mt-1">
      <input
        className={classnames(
          'appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-700 focus:border-green-700 sm:text-sm',
          { 'border-red-600': !!error },
        )}
        ref={ref}
        {...props}
      />
    </div>
    {error && <Hint>{error}</Hint>}
  </>
));

Input.displayName = 'Input';

export default Input;
