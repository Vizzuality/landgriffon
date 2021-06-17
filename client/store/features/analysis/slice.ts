import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

// Define a type for the slice state
interface AnalysisState {
  isSidebarCollapsed: boolean;
  isSubContentCollapsed: boolean;
}

// Define the initial state using that type
const initialState: AnalysisState = {
  isSidebarCollapsed: false,
  isSubContentCollapsed: true,
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isSidebarCollapsed: action.payload,
    }),
    setSubContentCollapsed: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isSubContentCollapsed: action.payload,
    }),
  },
});

export const { setSidebarCollapsed, setSubContentCollapsed } = analysisSlice.actions;

export const isSidebarCollapsed = (state: RootState) => state.analysis.isSidebarCollapsed;

export const isSubContentCollapsed = (state: RootState) => state.analysis.isSubContentCollapsed;

export default analysisSlice.reducer;
