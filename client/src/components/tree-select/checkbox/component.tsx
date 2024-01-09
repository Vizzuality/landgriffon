import { forwardRef, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';

import type { RefObject, InputHTMLAttributes } from 'react';

const CustomCheckbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }
>(({ indeterminate = false, checked = false, className, ...props }, forwardedRef) => {
  const fallbackRef = useRef<HTMLInputElement>(null);
  const ref = forwardedRef || fallbackRef;

  useEffect(() => {
    if (!(ref as RefObject<HTMLInputElement>).current) return;

    (ref as RefObject<HTMLInputElement>).current.indeterminate = !checked && indeterminate;
  }, [checked, indeterminate, ref]);

  const onChange = useCallback(() => {
    // noop
  }, []);

  return (
    <input
      type="checkbox"
      className={classNames(
        'm-0.5 h-4 w-4 flex-shrink-0 rounded ring-navy-200 ring-offset-1 focus:outline-none focus:outline-offset-0 focus:ring-2 focus:ring-offset-0 active:ring-2 disabled:ring-0 disabled:ring-offset-0',
        checked || indeterminate ? 'bg-navy-4 border-none' : 'border border-gray-200',
        className,
      )}
      checked={checked}
      onChange={onChange}
      {...props}
      ref={ref}
    />
  );
});

CustomCheckbox.displayName = 'CustomCheckbox';

export default CustomCheckbox;
