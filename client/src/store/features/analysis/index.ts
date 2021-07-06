import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

// Define a type for the slice state
export interface AnalysisState {
  visualizationMode: 'map' | 'table' | 'chart';
  isSidebarCollapsed: boolean;
  isSubContentCollapsed: boolean;
}

type FeatureState = RootState & { analysis: AnalysisState };

// Define the initial state using that type
const initialState: AnalysisState = {
  visualizationMode: 'map',
  isSidebarCollapsed: false,
  isSubContentCollapsed: true,
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
  },
});

export const { setVisualizationMode, setSidebarCollapsed, setSubContentCollapsed } =
  analysisSlice.actions;

export const visualizationMode = (state: FeatureState) => state.analysis.visualizationMode;

export const isSidebarCollapsed = (state: FeatureState) => state.analysis.isSidebarCollapsed;

export const isSubContentCollapsed = (state: FeatureState) => state.analysis.isSubContentCollapsed;

export default analysisSlice.reducer;
