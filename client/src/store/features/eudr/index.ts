import { createSlice } from '@reduxjs/toolkit';

import { DATES_RANGE } from 'containers/analysis-eudr/filters/years-range';

import type { Option } from '@/components/forms/select';
import type { VIEW_BY_OPTIONS } from 'containers/analysis-eudr/suppliers-stacked-bar';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

export type EUDRState = {
  viewBy: (typeof VIEW_BY_OPTIONS)[number]['value'];
  filters: {
    materials: Option[];
    origins: Option[];
    plots: Option[];
    suppliers: Option[];
    dates: {
      from: Date;
      to: Date;
    };
  };
};

export const initialState: EUDRState = {
  viewBy: 'materials',
  filters: {
    materials: [],
    origins: [],
    plots: [],
    suppliers: [],
    dates: {
      from: DATES_RANGE[0],
      to: DATES_RANGE[1],
    },
  },
};

export const EUDRSlice = createSlice({
  name: 'eudr',
  initialState,
  reducers: {
    setViewBy: (state, action: PayloadAction<EUDRState['viewBy']>) => ({
      ...state,
      viewBy: action.payload,
    }),
    setFilters: (state, action: PayloadAction<Partial<EUDRState['filters']>>) => ({
      ...state,
      filters: {
        ...state.filters,
        ...action.payload,
      },
    }),
  },
});

export const { setViewBy, setFilters } = EUDRSlice.actions;

export const eudr = (state: RootState) => state['eudr'];

export default EUDRSlice.reducer;
