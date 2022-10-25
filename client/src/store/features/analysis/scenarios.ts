import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { Scenario } from 'containers/scenarios/types';

export type ScenarioComparisonMode = 'relative' | 'absolute';

export type ScenariosState = {
  isComparisonEnabled: boolean;
  comparisonMode: ScenarioComparisonMode;
  /**
   * The current scenario id
   * If the current scenario is the actual data, the id will be null
   */
  currentScenario: Scenario['id'] | null;
  scenarioToCompare: Scenario['id'] | null;
  // To remove
  searchTerm: string;
  filter: 'all' | 'private' | 'public';
  sort: '-updatedAt' | 'title';
  pagination: {
    page: number;
    size: number;
  };
};

// Define the initial state using that type
export const initialState: ScenariosState = {
  isComparisonEnabled: false,
  comparisonMode: 'absolute',
  currentScenario: null,
  scenarioToCompare: null,
  searchTerm: null,
  filter: 'all',
  sort: '-updatedAt',
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
    setComparisonEnabled: (
      state,
      action: PayloadAction<ScenariosState['isComparisonEnabled']>,
    ) => ({
      ...state,
      isComparisonEnabled: action.payload,
    }),
    setScenarioToCompare: (state, action: PayloadAction<ScenariosState['scenarioToCompare']>) => ({
      ...state,
      scenarioToCompare: action.payload,
    }),
    setComparisonMode: (state, action: PayloadAction<ScenariosState['comparisonMode']>) => ({
      ...state,
      comparisonMode: action.payload,
    }),
    setScenarioFilter: (state, action: PayloadAction<ScenariosState['filter']>) => ({
      ...state,
      filter: action.payload,
    }),
    setSort: (state, action: PayloadAction<ScenariosState['sort']>) => ({
      ...state,
      sort: action.payload,
    }),
    setSearchTerm: (state, action: PayloadAction<ScenariosState['searchTerm']>) => ({
      ...state,
      searchTerm: action.payload,
    }),
  },
});

export const {
  setCurrentScenario,
  setComparisonEnabled,
  setScenarioToCompare,
  setComparisonMode,
  setScenarioFilter,
  setSort,
  setSearchTerm,
} = analysisScenariosSlice.actions;

export const scenarios = (state: RootState) => state['analysis/scenarios'];

export default analysisScenariosSlice.reducer;
