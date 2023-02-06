import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

const THEMES = {
  default:
    'border w-full rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 px-3',
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  theme?: 'default';
  error?: string;
  showHint?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, theme = 'default', showHint = true, error, ...props }, ref) => (
    <>
      <div className={classnames('mt-1', className)}>
        <textarea
          className={classnames([THEMES[theme]], {
            'border-red-600': !!error,
          })}
          ref={ref}
          {...props}
        />
      </div>
      {error && showHint && <Hint>{error}</Hint>}
    </>
  ),
);

Textarea.displayName = 'Textarea';

export default Textarea;
