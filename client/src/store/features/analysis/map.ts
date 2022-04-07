import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from 'store';
import type { Layer, Material } from 'types';

const DEFAULT_LAYER_ATTRIBUTES = {
  order: 0,
  active: false,
  opacity: 1,
};

type MaterialLayer = Layer & {
  material?: {
    label: string;
    value: Material['id'];
  };
};

type RiskLayer = Layer & {
  material?: {
    label: string;
    value: Material['id'];
  };
};

export type AnalysisMapState = {
  // User layers; not used, but it's prepared for the future
  userLayers: Layer[];
  // Custom LG layers
  layers: {
    material: MaterialLayer;
    risk: RiskLayer;
    impact: Layer;
  };
};

type FeatureState = RootState & { 'analysis/map': AnalysisMapState };

// Define the initial state using that type
export const initialState: AnalysisMapState = {
  userLayers: [],
  layers: {
    material: { ...DEFAULT_LAYER_ATTRIBUTES },
    risk: { ...DEFAULT_LAYER_ATTRIBUTES },
    impact: {
      ...DEFAULT_LAYER_ATTRIBUTES,
      active: true,
    },
  },
};

export const analysisMapSlice = createSlice({
  name: 'analysisMap',
  initialState,
  reducers: {
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
        [action.payload.id]: action.payload.layer,
      },
    }),
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
  },
});

export const { setLayer, setUserLayer, setUserLayers } = analysisMapSlice.actions;

export const analysisMap = (state: FeatureState) => state['analysis/map'];

export default analysisMapSlice.reducer;
