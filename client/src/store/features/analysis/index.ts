import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { Scenario } from 'containers/scenarios/types';
import { Indicator } from 'types';

// Define a type for the slice state
type Option = {
  label: string;
  value: string;
};

export type AnalysisState = {
  visualizationMode: 'map' | 'table' | 'chart';
  isSidebarCollapsed: boolean;
  isSubContentCollapsed: boolean;
  currentScenario: Scenario['id'];
  scenarioToCompare: Scenario['id'];
  comparisonMode: 'percentage' | 'absolute' | 'both';
  layer: 'impact' | 'risk' | 'material';
  scenarioCurrentTab: 'interventions' | 'growth';
  interventions: {
    step: 1 | 2;
  };
  filters: {
    indicator: Option;
    indicators: Indicator[];
    by: string;
    startYear: number;
    endYear: number;
    materials: Option[];
    origins: Option[];
    suppliers: Option[];
    interventionType: string;
  };
};

type FeatureState = RootState & { analysis: AnalysisState };

// Define the initial state using that type
const initialState: AnalysisState = {
  visualizationMode: 'map',
  isSidebarCollapsed: true,
  isSubContentCollapsed: true,
  currentScenario: null,
  scenarioToCompare: null,
  comparisonMode: null,
  layer: 'material',
  scenarioCurrentTab: 'interventions',
  interventions: {
    step: 1,
  },
  filters: {
    indicator: null,
    indicators: [],
    by: 'material',
    startYear: null,
    endYear: null,
    materials: [],
    origins: [],
    suppliers: [],
    interventionType: 'new-supplier-location',
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
      action: PayloadAction<AnalysisState['isSubContentCollapsed']>,
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
    setLayer: (state, action: PayloadAction<AnalysisState['layer']>) => ({
      ...state,
      layer: action.payload,
    }),
    setScenarioTab: (state, action: PayloadAction<AnalysisState['scenarioCurrentTab']>) => ({
      ...state,
      scenarioCurrentTab: action.payload,
    }),
    setNewInterventionStep: (state, action: PayloadAction<1 | 2>) => ({
      ...state,
      interventions: {
        ...state.interventions,
        step: action.payload,
      },
    }),
    setFilter: (state, action: PayloadAction<{ id: string; value: unknown }>) => ({
      ...state,
      filters: {
        ...state.filters,
        [action.payload.id]: action.payload.value,
      },
    }),
    setFilters: (state, action: PayloadAction<AnalysisState['filters']>) => ({
      ...state,
      filters: {
        ...state.filters,
        ...action.payload,
      },
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
  setScenarioTab,
  setNewInterventionStep,
  setLayer,
  setFilter,
  setFilters,
} = analysisSlice.actions;

export const analysis = (state: FeatureState) => state.analysis;

export default analysisSlice.reducer;
