import type { RootState } from 'store';
import type { AnalysisUIState } from './ui';
import type { AnalysisFiltersState } from './filters';

import type { ScenariosState } from './scenarios';

export { analysisUI } from './ui';
export { analysisFilters } from './filters';

export type AnalysisState = {
  'analysis/ui': AnalysisUIState;
  'analysis/filters': AnalysisFiltersState;
  'analysis/scenarios': ScenariosState;
};

type FeatureState = RootState & { analysis: AnalysisState };

export const analysis = (state: FeatureState) => state.analysis;
