import { useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  analysisUI,
  setSidebarCollapsed,
  setSubContentCollapsed,
} from 'store/features/analysis/ui';

const ICON_CLASSNAMES = 'h-4 w-4 text-gray-900';

const CollapseButton: React.FC = () => {
  const { isSidebarCollapsed, isSubContentCollapsed } = useAppSelector(analysisUI);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    if (!isSubContentCollapsed) dispatch(setSubContentCollapsed(true));
    dispatch(setSidebarCollapsed(!isSidebarCollapsed));
  }, [dispatch, isSidebarCollapsed, isSubContentCollapsed]);

  return (
    <button
      type="button"
      className="rounded-full border border-gray-300 w-10 h-10 flex justify-center items-center bg-white cursor-pointer hover:bg-green-50 hover:border-green-700 focus:outline-none"
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
