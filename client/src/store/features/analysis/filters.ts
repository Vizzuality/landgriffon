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
};

type FeatureState = RootState & { 'analysis/filters': AnalysisFiltersState };

// Define the initial state using that type
export const initialState: AnalysisFiltersState = {
  layer: 'impact',
  indicator: null,
  indicators: [],
  by: 'material',
  startYear: null,
  endYear: null,
  materials: [],
  origins: [],
  suppliers: [],
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
    setFilters: (state, action: PayloadAction<Partial<AnalysisFiltersState>>) => ({
      ...state,
      ...action.payload,
    }),
    resetFiltersAndOverride: (state, action: PayloadAction<Partial<AnalysisFiltersState>>) => ({
      ...state,
      ...initialState,
      ...action.payload,
    }),
  },
});

export const { setLayer, setFilter, setFilters, resetFiltersAndOverride } =
  analysisFiltersSlice.actions;

export const analysisFilters = (state: FeatureState) => state['analysis/filters'];

export default analysisFiltersSlice.reducer;
