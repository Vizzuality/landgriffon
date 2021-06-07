import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

// Define a type for the slice state
interface AnalysisState {
  isSidebarCollapsed: boolean
}

// Define the initial state using that type
const initialState: AnalysisState = {
  isSidebarCollapsed: false,
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isSidebarCollapsed: action.payload,
    }),
  },
});

export const { setSidebarCollapsed } = analysisSlice.actions;

export const isSidebarCollapsed = (state: RootState) => state.analysis.isSidebarCollapsed;

export default analysisSlice.reducer;
