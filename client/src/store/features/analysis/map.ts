import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { ViewState } from 'react-map-gl/src/mapbox/mapbox';
import type { RootState } from 'store';
import type { Layer } from 'types';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
};

const DEFAULT_LAYER_ATTRIBUTES: Partial<Layer> = {
  order: 0,
  active: false,
  opacity: 0.7,
  loading: false,
  isContextual: false,
};

const DEFAULT_DECKGL_PROPS = {
  data: [],
  wireframe: false,
  filled: true,
  stroked: true,
  extruded: false,
  highPrecision: 'auto',
  pickable: true,
  coverage: 0.9,
  lineWidthMinPixels: 2,
  opacity: DEFAULT_LAYER_ATTRIBUTES.opacity,
  visible: DEFAULT_LAYER_ATTRIBUTES.active,
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
  layers: Record<Layer['id'], Layer>;
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
  // Deck.gl layer props by layer id
  layerDeckGLProps: Record<Layer['id'], any>;
};

type FeatureState = RootState & { 'analysis/map': AnalysisMapState };

// Define the initial state using that type
export const initialState: AnalysisMapState = {
  viewState: INITIAL_VIEW_STATE,
  userLayers: [],
  layers: {
    impact: {
      id: 'impact',
      ...DEFAULT_LAYER_ATTRIBUTES,
      order: 0,
      active: true,
      isContextual: false,
    },
  },
  tooltipData: [],
  tooltipPosition: {
    viewport: null,
    x: 0,
    y: 0,
  },
  layerDeckGLProps: {
    impact: DEFAULT_DECKGL_PROPS,
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
        id: Layer['id'];
        layer: Partial<Layer>;
      }>,
    ) => {
      // only one contextual layer active at the same time, set the rest as disabled
      if (
        'active' in action.payload.layer &&
        action.payload.layer.active &&
        (('isContextual' in action.payload.layer && action.payload.layer.isContextual) ||
          state.layers[action.payload.id]?.isContextual)
      ) {
        Object.keys(state.layers).forEach((layerId) => {
          const layer = state.layers[layerId];
          if (layerId !== action.payload.id && layer.isContextual) {
            layer.active = false;
          }
        });
      }

      state.layers[action.payload.id] = {
        ...DEFAULT_LAYER_ATTRIBUTES,
        ...state.layers[action.payload.id],
        ...action.payload.layer,
      };
    },
    setLayerDeckGLProps: (
      state,
      action: PayloadAction<{
        id: Layer['id'];
        props: any;
      }>,
    ) => {
      state.layerDeckGLProps[action.payload.id] = {
        ...DEFAULT_DECKGL_PROPS,
        ...state.layerDeckGLProps[action.payload.id],
        ...action.payload.props,
      };
      return state;
    },
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
  setLayerDeckGLProps,
  setUserLayer,
  setUserLayers,
  setTooltipData,
  setTooltipPosition,
  setLayerOrder,
} = analysisMapSlice.actions;

export const analysisMap = (state: FeatureState) => state['analysis/map'];

export default analysisMapSlice.reducer;
