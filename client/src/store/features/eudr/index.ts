import { createSlice } from '@reduxjs/toolkit';

import { DATES_RANGE } from 'containers/analysis-eudr/filters/years-range';

import type { Option } from '@/components/forms/select';
import type { VIEW_BY_OPTIONS } from 'containers/analysis-eudr/suppliers-stacked-bar';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

type LayerConfiguration = {
  active?: boolean;
  opacity?: number;
  dateFrom?: string;
  dateTo?: string;
  date?: string;
  month?: number;
  year?: number;
};

export type EUDRState = {
  viewBy: (typeof VIEW_BY_OPTIONS)[number]['value'];
  totalSuppliers: number;
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
  planetLayer: LayerConfiguration;
  planetCompareLayer: LayerConfiguration;
  supplierLayer: LayerConfiguration;
  contextualLayers: Record<string, LayerConfiguration>;
};

export const initialState: EUDRState = {
  viewBy: 'materials',
  totalSuppliers: 0,
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
      year: 2020,
    },
    ['real-time-deforestation-alerts-since-2020-radd']: {
      active: false,
      opacity: 1,
      dateFrom: '2020-01-01',
      dateTo: '2024-07-27',
    },
  },
  planetLayer: {
    active: false,
    month: 12,
    year: 2020,
  },
  planetCompareLayer: {
    active: false,
    month: 2,
    year: 2024,
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
    setTotalSuppliers: (state, action: PayloadAction<EUDRState['totalSuppliers']>) => ({
      ...state,
      totalSuppliers: action.payload,
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
    setSupplierLayer: (state, action: PayloadAction<LayerConfiguration>) => ({
      ...state,
      supplierLayer: {
        ...state.supplierLayer,
        ...action.payload,
      },
    }),
    setContextualLayer: (
      state,
      action: PayloadAction<{ layer: string; configuration: LayerConfiguration }>,
    ) => ({
      ...state,
      contextualLayers: {
        ...state.contextualLayers,
        [action.payload.layer]: {
          ...state.contextualLayers[action.payload.layer],
          ...action.payload.configuration,
        },
      },
    }),
    setPlanetLayer: (state, action: PayloadAction<LayerConfiguration>) => ({
      ...state,
      planetLayer: {
        ...state.planetLayer,
        ...action.payload,
      },
    }),
    setPlanetCompareLayer: (state, action: PayloadAction<LayerConfiguration>) => ({
      ...state,
      planetCompareLayer: {
        ...state.planetCompareLayer,
        ...action.payload,
      },
    }),
  },
});

export const {
  setViewBy,
  setTotalSuppliers,
  setFilters,
  setBasemap,
  setSupplierLayer,
  setContextualLayer,
  setPlanetLayer,
  setPlanetCompareLayer,
} = EUDRSlice.actions;

export const eudr = (state: RootState) => state['eudr'];

export default EUDRSlice.reducer;
