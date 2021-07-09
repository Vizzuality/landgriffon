import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';

import { analysis, setVisualizationMode } from 'store/features/analysis';
import type { AnalysisState } from 'store/features/analysis';
import Component from './component';

const ModeControlContainer = () => {
  const { visualizationMode } = useAppSelector(analysis);
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { mode } = query;

  useEffect(() => {
    if (mode) {
      const selectedMode = mode as AnalysisState['visualizationMode'];
      dispatch(setVisualizationMode(selectedMode));
    }
  }, [mode]);

  return <Component query={query} mode={visualizationMode} />;
};

export default ModeControlContainer;
