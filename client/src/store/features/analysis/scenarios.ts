import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { Scenario } from 'containers/scenarios/types';

export type ScenariosState = {
  mode: 'list' | 'edit';
  comparisonMode: 'percentage' | 'absolute' | 'both';
  // Scenario ID for selected, edition and creation
  currentScenario: Scenario['id'];
  scenarioToCompare: Scenario['id'];
  scenarioCurrentTab: 'interventions' | 'growth';
  interventionsStep: 1 | 2;
  searchTerm: string;
  filter: 'all' | 'private' | 'public';
  sort: 'updatedAt' | 'title';
  pagination: {
    page: number;
    size: number;
  };
};

type FeatureState = RootState & { analysis: ScenariosState };

// Define the initial state using that type
export const initialState: ScenariosState = {
  mode: 'list',
  comparisonMode: null,
  currentScenario: null,
  scenarioToCompare: null,
  scenarioCurrentTab: 'interventions',
  interventionsStep: 1,
  searchTerm: null,
  filter: 'all',
  sort: 'updatedAt',
  pagination: {
    page: 1,
    size: 300,
  },
};

export const analysisScenariosSlice = createSlice({
  name: 'analysis/scenarios',
  initialState,
  reducers: {
    setCurrentScenario: (state, action: PayloadAction<ScenariosState['currentScenario']>) => ({
      ...state,
      currentScenario: action.payload,
    }),
    setScenarioToCompare: (state, action: PayloadAction<ScenariosState['scenarioToCompare']>) => ({
      ...state,
      scenarioToCompare: action.payload,
    }),
    setMode: (state, action: PayloadAction<ScenariosState['mode']>) => ({
      ...state,
      mode: action.payload,
    }),
    setComparisonMode: (state, action: PayloadAction<ScenariosState['comparisonMode']>) => ({
      ...state,
      comparisonMode: action.payload,
    }),
    setScenarioTab: (state, action: PayloadAction<ScenariosState['scenarioCurrentTab']>) => ({
      ...state,
      scenarioCurrentTab: action.payload,
    }),
    setScenarioFilter: (state, action: PayloadAction<ScenariosState['filter']>) => ({
      ...state,
      filter: action.payload,
    }),
    setSort: (state, action: PayloadAction<ScenariosState['sort']>) => ({
      ...state,
      sort: action.payload,
    }),
    setNewInterventionStep: (
      state,
      action: PayloadAction<ScenariosState['interventionsStep']>,
    ) => ({
      ...state,
      interventionsStep: action.payload,
    }),
    setSearchTerm: (state, action: PayloadAction<ScenariosState['searchTerm']>) => ({
      ...state,
      searchTerm: action.payload,
    }),
  },
});

export const {
  setCurrentScenario,
  setScenarioToCompare,
  setMode,
  setComparisonMode,
  setScenarioTab,
  setScenarioFilter,
  setSort,
  setNewInterventionStep,
  setSearchTerm,
} = analysisScenariosSlice.actions;

export const scenarios = (state: FeatureState) => state['analysis/scenarios'];

export default analysisScenariosSlice.reducer;
