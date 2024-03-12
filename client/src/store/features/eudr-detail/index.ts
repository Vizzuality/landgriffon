import { createSlice } from '@reduxjs/toolkit';

import { DATES_RANGE } from 'containers/analysis-eudr-detail/filters/years-range';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

export type EUDRDetailState = {
  filters: {
    dates: {
      from: string;
      to: string;
    };
  };
};

export const initialState: EUDRDetailState = {
  filters: {
    dates: {
      from: DATES_RANGE[0],
      to: DATES_RANGE[1],
    },
  },
};

export const EUDRSlice = createSlice({
  name: 'eudrDetail',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EUDRDetailState['filters']>>) => ({
      ...state,
      filters: {
        ...state.filters,
        ...action.payload,
      },
    }),
  },
});

export const { setFilters } = EUDRSlice.actions;

export const eudrDetail = (state: RootState) => state['eudrDetail'];

export default EUDRSlice.reducer;
