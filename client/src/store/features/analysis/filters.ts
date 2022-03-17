import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from 'store';
import type { Indicator } from 'types';

type Option = {
  label: string;
  value: string;
};

export type AnalysisFiltersState = {
  layer: 'impact' | 'risk' | 'material';
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

type FeatureState = RootState & { 'analysis/filters': AnalysisFiltersState };

// Define the initial state using that type
export const initialState: AnalysisFiltersState = {
  layer: 'material',
  indicator: null,
  indicators: [],
  by: 'material',
  startYear: null,
  endYear: null,
  materials: [],
  origins: [],
  suppliers: [],
  interventionType: 'new-supplier-location',
};

export const analysisFiltersSlice = createSlice({
  name: 'analysisFilters',
  initialState,
  reducers: {
    setLayer: (state, action: PayloadAction<AnalysisFiltersState['layer']>) => ({
      ...state,
      layer: action.payload,
    }),
    setFilter: (state, action: PayloadAction<{ id: string; value: unknown }>) => ({
      ...state,
      [action.payload.id]: action.payload.value,
    }),
    setFilters: (state, action: PayloadAction<AnalysisFiltersState>) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const { setLayer, setFilter, setFilters } = analysisFiltersSlice.actions;

export const analysisFilters = (state: FeatureState) => state['analysis/filters'];

export default analysisFiltersSlice.reducer;
