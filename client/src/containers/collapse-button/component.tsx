import { useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

const ICON_CLASSNAMES = 'h-4 w-4 text-gray-900';

const CollapseButton: React.FC<{
  isCollapsed: boolean;
  onClick: (isCollapsed: boolean) => void;
}> = ({ isCollapsed, onClick }) => {
  const handleClick = useCallback(() => onClick(!isCollapsed), [isCollapsed, onClick]);

  return (
    <button
      type="button"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-navy-400/20 focus:ring-offset-1"
      onClick={handleClick}
    >
      {isCollapsed ? (
        <ChevronRightIcon className={ICON_CLASSNAMES} />
      ) : (
        <ChevronLeftIcon className={ICON_CLASSNAMES} />
      )}
    </button>
  );
};

export default CollapseButton;
