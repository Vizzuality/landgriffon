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
  newInterventionData: {
    title: string;
    interventionDescription?: string;
    percentage: number;
    materialsIds: string[];
    businessUnitsIds: string;
    startYear: number;
    endYear: number;
    type: 'new-supplier-location' | 'production-efficiency' | 'new-material';
    suppliersIds: string[];
    adminRegionsIds: string[];
    newMaterialId: string;
    newMaterialTonnageRatio: number;
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
  sort: '-updatedAt' | 'title';
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
    businessUnitsIds: null,
    startYear: null,
    endYear: null,
    type: 'new-supplier-location',
    suppliersIds: null,
    adminRegionsIds: null,
    newMaterialTonnageRatio: null,
    newMaterialId: null,
    newT1SupplierId: null,
    newProducerId: null,
    newLocationType: null,
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
    setNewInterventionData: (
      state,
      action: PayloadAction<ScenariosState['newInterventionData']>,
    ) => ({
      ...state,
      newInterventionData: {
        ...state.newInterventionData,
        ...action.payload,
      },
    }),
    resetInterventionData: (state) => ({
      ...state,
      newInterventionData: initialState.newInterventionData,
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
  setNewInterventionData,
  resetInterventionData,
} = analysisScenariosSlice.actions;

export const scenarios = (state: FeatureState) => state['analysis/scenarios'];

export default analysisScenariosSlice.reducer;
