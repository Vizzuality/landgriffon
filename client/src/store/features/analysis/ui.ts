import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from 'store';

export type AnalysisUIState = {
  visualizationMode: 'map' | 'table' | 'chart';
  isSidebarCollapsed: boolean;
  isSubContentCollapsed: boolean;
};

type FeatureState = RootState & { 'analysis/ui': AnalysisUIState };

// Define the initial state using that type
export const initialState: AnalysisUIState = {
  visualizationMode: 'map',
  isSidebarCollapsed: false,
  isSubContentCollapsed: true,
};

export const analysisUISlice = createSlice({
  name: 'analysisUI',
  initialState,
  reducers: {
    setVisualizationMode: (state, action: PayloadAction<AnalysisUIState['visualizationMode']>) => ({
      ...state,
      visualizationMode: action.payload,
    }),
    setSidebarCollapsed: (state, action: PayloadAction<AnalysisUIState['isSidebarCollapsed']>) => ({
      ...state,
      isSidebarCollapsed: action.payload,
    }),
    setSubContentCollapsed: (
      state,
      action: PayloadAction<AnalysisUIState['isSubContentCollapsed']>,
    ) => ({
      ...state,
      isSubContentCollapsed: action.payload,
    }),
  },
});

export const { setVisualizationMode, setSidebarCollapsed, setSubContentCollapsed } =
  analysisUISlice.actions;

export const analysisUI = (state: FeatureState) => state['analysis/ui'];

export default analysisUISlice.reducer;
