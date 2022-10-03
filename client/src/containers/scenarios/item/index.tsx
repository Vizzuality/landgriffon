import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import Component from './component';
import React, { useEffect } from 'react';
import { setCurrentScenario } from 'store/features/analysis';
import { ACTUAL_DATA } from '../constants';

type ScenarioItemContainerProps = Omit<
  React.ComponentProps<typeof Component>,
  'isComparisonAvailable'
>;

const ScenarioItemContainer = (props: ScenarioItemContainerProps) => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Alongside the `isComparisonAvailable` prop, this ensures that whatever scenario was selected is reset when entering the chart view, as it doesn't support comparison yet
    if (visualizationMode === 'chart') {
      dispatch(setCurrentScenario(ACTUAL_DATA.id));
    }
  }, [dispatch, visualizationMode]);

  return <Component {...props} />;
};

export default ScenarioItemContainer;
