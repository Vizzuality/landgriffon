import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from 'store';
import type { Layer } from 'types';

const DEFAULT_LAYER_ATTRIBUTES = {
  order: 0,
  active: false,
  opacity: 1,
};

export type AnalysisMapState = {
  layers: Layer[];
};

type FeatureState = RootState & { 'analysis/map': AnalysisMapState };

// Define the initial state using that type
export const initialState: AnalysisMapState = {
  layers: [],
};

export const analysisMapSlice = createSlice({
  name: 'analysisMap',
  initialState,
  reducers: {
    // Add or update the layer
    setLayers: (state, action: PayloadAction<Layer>) => {
      const layerExists = state.layers.find((layer) => layer.id === action.payload.id);
      const layers = layerExists
        ? state.layers.map((layer) => {
            if (layer.id === action.payload.id) {
              return { ...DEFAULT_LAYER_ATTRIBUTES, ...layer, ...action.payload };
            }
            return layer;
          })
        : [...state.layers, { ...DEFAULT_LAYER_ATTRIBUTES, ...action.payload }];
      return {
        ...state,
        layers,
      };
    },
  },
});

export const { setLayers } = analysisMapSlice.actions;

export const analysisMap = (state: FeatureState) => state['analysis/map'];

export default analysisMapSlice.reducer;
