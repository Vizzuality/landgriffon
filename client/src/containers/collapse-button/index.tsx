import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysis, setSidebarCollapsed, setSubContentCollapsed } from 'store/features/analysis';
import Component from './component';

type CollapseButton = Readonly<{
  onClick?: () => void;
}>

const CollapseButtonContainer: React.FC<CollapseButton>= ({ onClick }: CollapseButton) => {
  const { isSidebarCollapsed, isSubContentCollapsed } = useAppSelector(analysis);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { query } = router;
  const { collapsed } = query;

  const handleClick = useCallback(() => {
    router.replace({
      pathname: '/analysis',
      query: {
        ...query,
        collapsed: !isSidebarCollapsed,
      },
    });

    !isSubContentCollapsed && dispatch(setSubContentCollapsed(true));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (collapsed) dispatch(setSidebarCollapsed(collapsed === 'true'));
  }, [collapsed]);

  return <Component active={isSidebarCollapsed} onClick={handleClick} />;
};

export default CollapseButtonContainer;
