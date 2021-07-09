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
  },
});

export const {
  setVisualizationMode,
  setSidebarCollapsed,
  setSubContentCollapsed,
  setCurrentScenario,
  setScenarioToCompare,
  setComparisonMode,
} = analysisSlice.actions;

export const analysis = (state: FeatureState) => state.analysis;

export default analysisSlice.reducer;
