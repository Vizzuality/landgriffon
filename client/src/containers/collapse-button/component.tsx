import { useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisUI, setSidebarCollapsed } from 'store/features/analysis/ui';

const ICON_CLASSNAMES = 'h-4 w-4 text-gray-900';

const CollapseButton: React.FC = () => {
  const { isSidebarCollapsed } = useAppSelector(analysisUI);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(setSidebarCollapsed(!isSidebarCollapsed));
  }, [dispatch, isSidebarCollapsed]);

  return (
    <button
      type="button"
      className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full cursor-pointer hover:shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy-400/20"
      onClick={handleClick}
    >
      {isSidebarCollapsed ? (
        <ChevronRightIcon className={ICON_CLASSNAMES} />
      ) : (
        <ChevronLeftIcon className={ICON_CLASSNAMES} />
      )}
    </button>
  );
};

export default CollapseButton;
