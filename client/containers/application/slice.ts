import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'lib/store';

// Define a type for the slice state
interface ApplicationState {
  isMenuMobileOpen: boolean
}

// Define the initial state using that type
const initialState: ApplicationState = {
  isMenuMobileOpen: false,
};

export const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setMenuMobileOpen: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isMenuMobileOpen: action.payload,
    }),
  },
});

export const { setMenuMobileOpen } = applicationSlice.actions;

export const isMenuMobileOpen = (state: RootState) => state.application.isMenuMobileOpen;

export default applicationSlice.reducer;
