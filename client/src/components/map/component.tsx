import { useState } from 'react';
import InteractiveMap from 'react-map-gl';
import type { DeckGLProps } from '@deck.gl/react/typed';
import DeckGL from '@deck.gl/react/typed';
import type { H3HexagonLayer } from '@deck.gl/geo-layers/typed';
import type { ViewState as MapboxViewState } from 'react-map-gl/src/mapbox/mapbox';

import DefaultMapStyle from './styles/map-style.json';
import SatelliteMapStyle from './styles/map-style-satellite.json';

import type { ComponentProps, Dispatch } from 'react';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

const MAP_STYLES = {
  terrain: DefaultMapStyle,
  satellite: SatelliteMapStyle,
};

export type MapStyle = keyof typeof MAP_STYLES;

export interface ViewState extends MapboxViewState {
  minZoom: number;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
};

interface MapProps {
  layers: H3HexagonLayer[];
  mapStyle?: MapStyle;
  initialViewState?: Partial<ViewState>;
  viewState?: ViewState;
  onViewStateChange?: Dispatch<
    Omit<Parameters<ComponentProps<typeof DeckGL>['onViewStateChange']>[0], 'viewState'> & {
      viewState: ViewState;
    }
  >;
}

const Map = ({
  children,
  mapStyle = 'terrain',
  viewState,
  initialViewState: partialInitialViewState,
  onViewStateChange,
  ...props
}: React.PropsWithChildren<MapProps>) => {
  const [localViewState, setLocalViewState] = useState({
    ...INITIAL_VIEW_STATE,
    ...partialInitialViewState,
    ...viewState,
  });

  const handleViewStateChange: DeckGLProps['onViewStateChange'] = (state) => {
    setLocalViewState(state.viewState as ViewState);
    onViewStateChange?.(state as Parameters<MapProps['onViewStateChange']>[0]);
  };

  return (
    <DeckGL
      initialViewState={localViewState}
      onViewStateChange={handleViewStateChange}
      controller
      {...props}
    >
      <InteractiveMap
        viewState={viewState}
        mapStyle={MAP_STYLES[mapStyle]}
        mapboxApiAccessToken={MAPBOX_API_TOKEN}
        className="-z-10"
      />
      {children}
    </DeckGL>
  );
};

export default Map;
