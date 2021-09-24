import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface UIState {
  isMenuMobileOpen: boolean;
}

// Define the initial state using that type
const initialState: UIState = {
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

export default applicationSlice.reducer;
