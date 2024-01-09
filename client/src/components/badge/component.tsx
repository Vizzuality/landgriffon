import { XIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { useCallback } from 'react';

import { THEME_CLASSNAMES } from './constants';

import type { BadgeProps } from './types';

const Badge: React.FC<BadgeProps> = ({
  data,
  children,
  className,
  removable = false,
  onClick,
  theme = 'default',
}) => {
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(data), [data, onClick];
    },
    [data, onClick],
  );

  return (
    <div
      className={classNames(
        'flex min-w-fit max-w-fit items-center gap-x-0.5 overflow-hidden px-2 py-px shadow-sm',
        className,
        THEME_CLASSNAMES[theme]?.wrapper,
        removable && 'pr-1',
      )}
    >
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          className={classNames(
            THEME_CLASSNAMES[theme].closeIcon,
            'inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full focus:outline-none',
          )}
          onClick={handleClick}
          aria-label="Remove"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default Badge;
