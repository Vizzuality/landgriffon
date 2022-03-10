import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  analysisUI,
  setSidebarCollapsed,
  setSubContentCollapsed,
} from 'store/features/analysis/ui';

import Component from './component';

const CollapseButtonContainer: React.FC = () => {
  const { isSidebarCollapsed, isSubContentCollapsed } = useAppSelector(analysisUI);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    if (!isSubContentCollapsed) dispatch(setSubContentCollapsed(true));
    dispatch(setSidebarCollapsed(!isSidebarCollapsed));
  }, [dispatch, isSidebarCollapsed, isSubContentCollapsed]);

  return <Component active={isSidebarCollapsed} onClick={handleClick} />;
};

export default CollapseButtonContainer;
