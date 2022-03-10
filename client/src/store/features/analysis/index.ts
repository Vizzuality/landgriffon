import { analysisUISlice } from './ui';
import { analysisFiltersSlice } from './filters';
import { analysisScenariosSlice } from './scenarios';

import type { RootState } from 'store';
import type { AnalysisUIState } from './ui';
import type { AnalysisFiltersState } from './filters';
import type { ScenariosState } from './scenarios';

export { analysisUI } from './ui';
export { analysisFilters } from './filters';
export { scenarios } from './scenarios';

export type AnalysisState = {
  'analysis/ui': AnalysisUIState;
  'analysis/filters': AnalysisFiltersState;
  'analysis/scenarios': ScenariosState;
};

type FeatureState = RootState & { analysis: AnalysisState };

export const {
  setVisualizationMode, setSidebarCollapsed, setSubContentCollapsed
} = analysisUISlice.actions;

export const { setLayer, setFilter, setFilters } = analysisFiltersSlice.actions;

export const {
  setCurrentScenario,
  setScenarioToCompare,
  setComparisonMode,
  setScenarioTab,
  setNewInterventionStep,
} = analysisScenariosSlice.actions;

export const analysis = (state: FeatureState) => state.analysis;
