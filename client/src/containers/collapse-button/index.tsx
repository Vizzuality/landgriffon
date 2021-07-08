import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysis, setSidebarCollapsed } from 'store/features/analysis';
import Component from './component';

const CollapseButtonContainer: React.FC = () => {
  const { isSidebarCollapsed } = useAppSelector(analysis);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { query } = router;
  const { collapsed } = query;

  const handleClick = useCallback(() => {
    router.push({
      pathname: '/analysis',
      query: {
        ...query,
        collapsed: !isSidebarCollapsed,
      },
    });
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (collapsed) dispatch(setSidebarCollapsed(collapsed === 'true'));
  }, [collapsed]);

  return <Component active={isSidebarCollapsed} onClick={handleClick} />;
};

export default CollapseButtonContainer;
