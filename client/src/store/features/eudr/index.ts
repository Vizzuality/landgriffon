import { createSlice } from '@reduxjs/toolkit';

import type { VIEW_BY_OPTIONS } from 'containers/analysis-eudr/suppliers-stacked-bar';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

export type EUDRState = {
  viewBy: (typeof VIEW_BY_OPTIONS)[number]['value'];
};

export const initialState: EUDRState = {
  viewBy: 'commodities',
};

export const EUDRSlice = createSlice({
  name: 'eudr',
  initialState,
  reducers: {
    setViewBy: (state, action: PayloadAction<EUDRState['viewBy']>) => ({
      ...state,
      viewBy: action.payload,
    }),
  },
});

export const { setViewBy } = EUDRSlice.actions;

export const eudr = (state: RootState) => state['eudr'];

export default EUDRSlice.reducer;
