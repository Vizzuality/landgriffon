import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';

import { visualizationMode, setVisualizationMode } from 'store/features/analysis';
import type { AnalysisState } from 'store/features/analysis';
import Component from './component';

const ModeControlContainer = () => {
  const currentMode = useAppSelector(visualizationMode);
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { mode } = query;

  useEffect(() => {
    if (mode) {
      const selectedMode = mode as AnalysisState['visualizationMode'];
      dispatch(setVisualizationMode(selectedMode));
    }
  }, [mode]);

  return <Component query={query} mode={currentMode} />;
};

export default ModeControlContainer;
