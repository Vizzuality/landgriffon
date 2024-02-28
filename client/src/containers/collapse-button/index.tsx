import { useCallback } from 'react';

import Component from './component';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisUI, setSidebarCollapsed } from 'store/features/analysis/ui';

const CollapseButton: React.FC = () => {
  const { isSidebarCollapsed } = useAppSelector(analysisUI);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(setSidebarCollapsed(!isSidebarCollapsed));
  }, [dispatch, isSidebarCollapsed]);

  return <Component onClick={handleClick} isCollapsed={isSidebarCollapsed} />;
};

export default CollapseButton;
