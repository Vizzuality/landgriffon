import type { RootState } from 'store';
import type { AnalysisUIState } from './ui';
import type { AnalysisFiltersState } from './filters';
import type { Indicator } from 'types';

import { initialState as scenariosInitialState, analysisScenariosSlice } from './scenarios';
import type { ScenariosState } from './scenarios';

export { analysisUI } from './ui';
export { analysisFilters } from './filters';

export type AnalysisState = {
  'analysis/ui': AnalysisUIState;
  'analysis/filters': AnalysisFiltersState;
  'analysis/scenarios': ScenariosState;
};

type FeatureState = RootState & { analysis: AnalysisState; 'analysis/scenarios': ScenariosState };

// Define the initial state using that type
// export const initialState: AnalysisState = {
//   'analysis/scenarios': scenariosInitialState,
// };

// export const analysisSlice = createSlice({
//   name: 'analysis',
//   initialState,
// });

// export const {
//   setVisualizationMode,
//   setSidebarCollapsed,
//   setSubContentCollapsed,
//   setLayer,
//   setFilter,
//   setFilters,
// } = analysisSlice.actions;

export const analysis = (state: FeatureState) => state.analysis;
export const scenarios = (state: FeatureState) => state.analysis['analysis/scenarios'];
export const {
  setCurrentScenario,
  setScenarioToCompare,
  setComparisonMode,
  setScenarioTab,
  setNewInterventionStep,
} = analysisScenariosSlice.actions;

// export default analysisSlice.reducer;
