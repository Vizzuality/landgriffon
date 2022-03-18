import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { Scenario } from 'containers/scenarios/types';

export type ScenariosState = {
  mode: 'list' | 'create' | 'edit';
  comparisonMode: 'percentage' | 'absolute' | 'both';
  currentScenario: Scenario['id'];
  scenarioToCompare: Scenario['id'];
  scenarioCurrentTab: 'interventions' | 'growth';
  interventionsStep: 1 | 2;
  newInterventionData: {
    interventionDescription?: string;
    percentage: number;
    materials: string[];
    suppliers: string[];
    originRegions: string[];
    materialTons: number;
    material: string[];
    supplier: string;
    producer: string;
    locationType: string;
    country: string;
    address: string;
  };
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
  newInterventionData: {
    interventionDescription: null,
    percentage: 100,
    materials: null,
    suppliers: null,
    originRegions: null,
    materialTons: null,
    material: null,
    supplier: null,
    producer: null,
    locationType: null, // duplicated
    country: null,
    address: null,
  },
  searchTerm: null,
  filter: 'all',
  sort: 'title',
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
    setNewInterventionStep: (
      state,
      action: PayloadAction<ScenariosState['interventionsStep']>,
    ) => ({
      ...state,
      interventionsStep: action.payload,
    }),
    setNewInterventionData: (
      state,
      action: PayloadAction<{
        id: string;
        value: unknown;
      }>,
    ) => ({
      ...state,
      newInterventionData: {
        ...state.newInterventionData,
        [action.payload.id]: action.payload.value,
      },
    }),
  },
});

export const {
  setCurrentScenario,
  setScenarioToCompare,
  setComparisonMode,
  setScenarioTab,
  setScenarioFilter,
  setNewInterventionStep,
  setNewInterventionData,
} = analysisScenariosSlice.actions;

export const scenarios = (state: FeatureState) => state['analysis/scenarios'];

export default analysisScenariosSlice.reducer;
