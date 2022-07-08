import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { Scenario, Intervention, InterventionTypes } from 'containers/scenarios/types';

export type ScenariosState = {
  mode: 'list' | 'edit';
  isComparisonEnabled: boolean;
  comparisonMode: 'percentage' | 'absolute' | 'both';
  // Scenario ID for selected, edition and creation
  currentScenario: Scenario['id'];
  scenarioToCompare: Scenario['id'];
  scenarioCurrentTab: 'interventions' | 'growth';
  interventionsStep: 1 | 2;
  interventionMode: 'edit' | 'create';
  currentIntervention: Intervention['id'];
  newInterventionData: {
    title: string;
    interventionDescription?: string;
    percentage: number;
    materialIds: string[];
    businessUnitIds: string;
    startYear: number;
    endYear: number;
    type: InterventionTypes;
    supplierIds: string[];
    adminRegionIds: string[];
    newMaterialId: string;
    newMaterialTonnageRatio: number;
    newT1SupplierId: string;
    newProducerId: string;
    newLocationType: string;
    newLocationCountryInput: string;
    newLocationAddressInput: string;
    newLocationLatitude: number;
    newLocationLongitude: number;
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
  isComparisonEnabled: false,
  comparisonMode: null,
  currentScenario: null,
  scenarioToCompare: null,
  scenarioCurrentTab: 'interventions',
  interventionsStep: 1,
  interventionMode: 'create',
  currentIntervention: null,
  newInterventionData: {
    title: 'InterventionTitle',
    interventionDescription: null,
    percentage: 100,
    materialIds: null,
    businessUnitIds: null,
    startYear: null,
    endYear: null,
    type: 'Source from new supplier or location',
    supplierIds: null,
    adminRegionIds: null,
    newMaterialTonnageRatio: null,
    newMaterialId: null,
    newT1SupplierId: null,
    newProducerId: null,
    newLocationType: null,
    newLocationCountryInput: null,
    newLocationAddressInput: null,
    newLocationLatitude: null,
    newLocationLongitude: null,
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
    setCurrentIntervention: (
      state,
      action: PayloadAction<ScenariosState['currentIntervention']>,
    ) => ({
      ...state,
      currentIntervention: action.payload,
    }),
    setInterventionMode: (state, action: PayloadAction<ScenariosState['interventionMode']>) => ({
      ...state,
      interventionMode: action.payload,
    }),
    setSearchTerm: (state, action: PayloadAction<ScenariosState['searchTerm']>) => ({
      ...state,
      searchTerm: action.payload,
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
    resetInterventionData: (state) => ({
      ...state,
      newInterventionData: initialState.newInterventionData,
    }),
  },
});

export const {
  setCurrentScenario,
  setComparisonEnabled,
  setScenarioToCompare,
  setMode,
  setComparisonMode,
  setScenarioTab,
  setScenarioFilter,
  setSort,
  setNewInterventionStep,
  setCurrentIntervention,
  setInterventionMode,
  setSearchTerm,
  setNewInterventionData,
  resetInterventionData,
} = analysisScenariosSlice.actions;

export const scenarios = (state: FeatureState) => state['analysis/scenarios'];

export default analysisScenariosSlice.reducer;
