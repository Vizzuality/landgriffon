import classNames from 'classnames';
import { useCallback } from 'react';

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

  const THEMES = {
    default: {
      wrapper: 'bg-green-50 rounded-xl',
    },
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center font-medium text-green-700 overflow-hidden shadow-sm px-2',
        THEMES[theme]?.wrapper,
        removable ? 'pr-1' : 'py-0',
        className,
      )}
    >
      <span
        className={classNames(
          'truncate text-ellipsis text-green-700',
          removable ? 'pr-0.5' : 'px-0.5',
        )}
      >
        {children}
      </span>
      {removable && (
        <button
          type="button"
          className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-900 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
          onClick={handleClick}
        >
          <span className="sr-only">Remove</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;
