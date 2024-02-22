import DefaultMapStyle from './styles/map-style-maplibre.json';
import SatelliteMapStyle from './styles/map-style-satellite-maplibre.json';

import type { ViewState, MapProps } from 'react-map-gl/maplibre';

export const DEFAULT_VIEW_STATE: Partial<ViewState> = {
  zoom: 2,
  latitude: 0,
  longitude: 0,
};

export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  padding: null,
};

export const enum StyleIds {
  terrain = 'terrain',
  satellite = 'satellite',
}

export const MAP_STYLES: { [key in StyleIds]: MapProps['mapStyle'] } = {
  terrain: DefaultMapStyle as MapProps['mapStyle'],
  satellite: SatelliteMapStyle as MapProps['mapStyle'],
};
