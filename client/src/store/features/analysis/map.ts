import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { ViewState } from 'react-map-gl/src/mapbox/mapbox';
import type { RootState } from 'store';
import type { Layer, Material } from 'types';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
};

const DEFAULT_LAYER_ATTRIBUTES = {
  order: 0,
  active: false,
  opacity: 0.7,
  loading: false,
  legend: {
    name: null,
    id: null,
    unit: null,
    min: null,
    items: [],
  },
};

type MaterialLayer = Layer & {
  material?: {
    label: string;
    value: Material['id'];
  };
  year?: number;
};

type RiskLayer = Layer & {
  material?: {
    label: string;
    value: Material['id'];
  };
  year?: number;
};

type TooltipData = {
  id: string;
  name: string;
  value?: number;
  unit?: string;
};

export type AnalysisMapState = {
  viewState: Partial<ViewState>;
  // User layers; not used, but it's prepared for the future
  userLayers: Layer[];
  // Custom LG layers
  layers: {
    material: MaterialLayer;
    risk: RiskLayer;
    impact: Layer;
  };
  // Tooltip state
  tooltipData: TooltipData[];
  tooltipPosition: {
    x: number;
    y: number;
    viewport?: {
      width: number;
      height: number;
    };
  };
};

type FeatureState = RootState & { 'analysis/map': AnalysisMapState };

// Define the initial state using that type
export const initialState: AnalysisMapState = {
  viewState: INITIAL_VIEW_STATE,
  userLayers: [],
  layers: {
    material: { id: 'h3-layer-material', ...DEFAULT_LAYER_ATTRIBUTES, order: 3 },
    risk: { id: 'h3-layer-risk', ...DEFAULT_LAYER_ATTRIBUTES },
    impact: {
      id: 'h3-layer-impact',
      ...DEFAULT_LAYER_ATTRIBUTES,
      active: true, // this layers should be always active
    },
  },
  tooltipData: [],
  tooltipPosition: {
    viewport: null,
    x: 0,
    y: 0,
  },
};

export const analysisMapSlice = createSlice({
  name: 'analysisMap',
  initialState,
  reducers: {
    setViewState: (state, action: PayloadAction<Partial<AnalysisMapState['viewState']>>) => ({
      ...state,
      viewState: {
        ...state.viewState,
        ...action.payload,
      },
    }),
    setLayer: (
      state,
      action: PayloadAction<{
        id: 'material' | 'risk' | 'impact';
        layer: MaterialLayer | RiskLayer | Layer;
      }>,
    ) => ({
      ...state,
      layers: {
        ...state.layers,
        [action.payload.id]: { ...state.layers[action.payload.id], ...action.payload.layer },
      },
    }),
    setLayerOrder: (state, action: PayloadAction<Layer['id'][]>) => {
      Object.values(state.layers).forEach((layer) => {
        layer.order = action.payload.indexOf(layer.id);
      });
      return state;
    },
    // Add or update the user layer
    setUserLayer: (state, action: PayloadAction<Layer>) => {
      const layerExists = state.userLayers.find((layer) => layer.id === action.payload.id);
      const userLayers = layerExists
        ? state.userLayers.map((layer) => {
            if (layer.id === action.payload.id) {
              return { ...DEFAULT_LAYER_ATTRIBUTES, ...layer, ...action.payload };
            }
            return layer;
          })
        : [...state.userLayers, { ...DEFAULT_LAYER_ATTRIBUTES, ...action.payload }];
      return {
        ...state,
        userLayers,
      };
    },
    // Add and replace all the user layers
    setUserLayers: (state, action: PayloadAction<Layer[]>) => {
      return {
        ...state,
        userLayers: action.payload?.map((layer) => ({ ...DEFAULT_LAYER_ATTRIBUTES, ...layer })),
      };
    },
    // Tooltip
    setTooltipData: (state, action: PayloadAction<TooltipData>) => {
      const exists = !!state.tooltipData.find(({ id }) => action.payload.id === id);
      // Remove tooltip is value is undefined but not zero
      if (exists && !action.payload.value && action.payload.value !== 0) {
        return {
          ...state,
          tooltipData: state.tooltipData.filter((data) => data.id !== action.payload.id),
        };
      }

      // If exists replace the info
      if (exists) {
        return {
          ...state,
          tooltipData: state.tooltipData.map((data) => {
            if (data.id === action.payload.id) {
              return { ...data, ...action.payload };
            }
            return data;
          }),
        };
      }

      // add data if doesn't exist
      return {
        ...state,
        tooltipData: [...state.tooltipData, action.payload],
      };
    },

    setTooltipPosition: (state, action: PayloadAction<AnalysisMapState['tooltipPosition']>) => ({
      ...state,
      tooltipPosition: action.payload,
    }),
  },
});

export const {
  setViewState,
  setLayer,
  setUserLayer,
  setUserLayers,
  setTooltipData,
  setTooltipPosition,
  setLayerOrder,
} = analysisMapSlice.actions;

export const analysisMap = (state: FeatureState) => state['analysis/map'];

export default analysisMapSlice.reducer;
