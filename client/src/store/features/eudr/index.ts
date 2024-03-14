import { createSlice } from '@reduxjs/toolkit';

import { DATES_RANGE } from 'containers/analysis-eudr/filters/years-range';

import type { Option } from '@/components/forms/select';
import type { VIEW_BY_OPTIONS } from 'containers/analysis-eudr/suppliers-stacked-bar';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

type LayerConfiguration = {
  active: boolean;
  opacity?: number;
  month?: number;
  year?: number;
};

export type EUDRState = {
  viewBy: (typeof VIEW_BY_OPTIONS)[number]['value'];
  filters: {
    materials: Option[];
    origins: Option[];
    plots: Option[];
    suppliers: Option[];
    dates: {
      from: string;
      to: string;
    };
  };
  // map
  basemap: 'light' | 'planet';
  planetCompare: boolean;
  supplierLayer: LayerConfiguration;
  contextualLayers: Record<string, LayerConfiguration>;
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
  basemap: 'light',
  planetCompare: false,
  supplierLayer: {
    active: true,
    opacity: 1,
  },
  contextualLayers: {
    ['forest-cover-2020-ec-jrc']: {
      active: false,
      opacity: 1,
    },
    ['deforestation-alerts-2020-2022-hansen']: {
      active: false,
      opacity: 1,
    },
    ['real-time-deforestation-alerts-since-2020-radd']: {
      active: false,
      opacity: 1,
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
    setBasemap: (state, action: PayloadAction<EUDRState['basemap']>) => ({
      ...state,
      basemap: action.payload,
    }),
    setPlanetCompare: (state, action: PayloadAction<boolean>) => ({
      ...state,
      planetCompare: action.payload,
    }),
    setSupplierLayer: (state, action: PayloadAction<LayerConfiguration>) => ({
      ...state,
      supplierLayer: action.payload,
    }),
    setContextualLayer: (
      state,
      action: PayloadAction<{ layer: string; configuration: LayerConfiguration }>,
    ) => ({
      ...state,
      contextualLayers: {
        ...state.contextualLayers,
        [action.payload.layer]: action.payload.configuration,
      },
    }),
  },
});

export const {
  setViewBy,
  setFilters,
  setBasemap,
  setPlanetCompare,
  setSupplierLayer,
  setContextualLayer,
} = EUDRSlice.actions;

export const eudr = (state: RootState) => state['eudr'];

export default EUDRSlice.reducer;
