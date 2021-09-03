import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { Scenario } from 'containers/scenarios/types';

// Define a type for the slice state
export type AnalysisState = {
  visualizationMode: 'map' | 'table' | 'chart';
  isSidebarCollapsed: boolean;
  isSubContentCollapsed: boolean;
  currentScenario: Scenario['id'];
  scenarioToCompare: Scenario['id'];
  comparisonMode: 'percentage' | 'absolute' | 'both';
  filters: {
    indicator: string;
    by: string;
    year: number;
    years: {
      from: number;
      to: number;
    };
    material: string[];
    origins: string[];
    suppliers: string[];
  };
};

type FeatureState = RootState & { analysis: AnalysisState };

// Define the initial state using that type
const initialState: AnalysisState = {
  visualizationMode: 'map',
  isSidebarCollapsed: false,
  isSubContentCollapsed: true,
  currentScenario: null,
  scenarioToCompare: null,
  comparisonMode: null,
  filters: {
    indicator: null,
    by: 'material',
    year: 2015,
    years: {
      from: 2011,
      to: 2015,
    },
    material: [],
    origins: [],
    suppliers: [],
  },
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setVisualizationMode: (state, action: PayloadAction<AnalysisState['visualizationMode']>) => ({
      ...state,
      visualizationMode: action.payload,
    }),
    setSidebarCollapsed: (state, action: PayloadAction<AnalysisState['isSidebarCollapsed']>) => ({
      ...state,
      isSidebarCollapsed: action.payload,
    }),
    setSubContentCollapsed: (
      state,
      action: PayloadAction<AnalysisState['isSubContentCollapsed']>
    ) => ({
      ...state,
      isSubContentCollapsed: action.payload,
    }),
    setCurrentScenario: (state, action: PayloadAction<AnalysisState['currentScenario']>) => ({
      ...state,
      currentScenario: action.payload,
    }),
    setScenarioToCompare: (state, action: PayloadAction<AnalysisState['scenarioToCompare']>) => ({
      ...state,
      scenarioToCompare: action.payload,
    }),
    setComparisonMode: (state, action: PayloadAction<AnalysisState['comparisonMode']>) => ({
      ...state,
      comparisonMode: action.payload,
    }),
    setFilter: (state, action: PayloadAction<{ id: string; value: any }>) => ({
      ...state,
      filters: {
        ...state.filters,
        [action.payload.id]: action.payload.value,
      },
    }),
    setFilters: (state, action: PayloadAction<AnalysisState['filters']>) => ({
      ...state,
      filters: action.payload,
    }),
  },
});

export const {
  setVisualizationMode,
  setSidebarCollapsed,
  setSubContentCollapsed,
  setCurrentScenario,
  setScenarioToCompare,
  setComparisonMode,
  setFilter,
  setFilters,
} = analysisSlice.actions;

export const analysis = (state: FeatureState) => state.analysis;

export default analysisSlice.reducer;
