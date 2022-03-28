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
    title: string;
    interventionDescription?: string;
    percentage: number;
    materialsIds: string[];
    suppliersIds: string[];
    adminRegionsIds: string[];
    newMaterialTonnageRatio: number;
    newMaterialId: string;
    newT1SupplierId: string;
    newProducerId: string;
    newLocationType: string;
    newLocationCountryInput: string;
    newLocationAddressInput: string;
    newIndicatorCoefficients: {
      DF_LUC_T: number;
      UWU_T: number;
      BL_LUC_T: number;
      GHG_LUC_T: number;
    };
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
    title: 'InterventionTitle',
    interventionDescription: null,
    percentage: 100,
    materialsIds: null,
    suppliersIds: null,
    adminRegionsIds: null,
    newMaterialTonnageRatio: null,
    newMaterialId: null,
    newT1SupplierId: null,
    newProducerId: null,
    newLocationType: null, // duplicated
    newLocationCountryInput: null,
    newLocationAddressInput: null,
    newIndicatorCoefficients: {
      DF_LUC_T: null,
      UWU_T: null,
      BL_LUC_T: null,
      GHG_LUC_T: null,
    },
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
      action: PayloadAction<Partial<ScenariosState['newInterventionData']>>,
    ) => ({
      ...state,
      newInterventionData: {
        ...state.newInterventionData,
        ...action.payload,
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
