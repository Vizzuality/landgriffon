import InteractiveMap from 'react-map-gl';
import DeckGL from '@deck.gl/react/typed';
import React, { useMemo, useState } from 'react';

import DefaultMapStyle from './styles/map-style.json';
import SatelliteMapStyle from './styles/map-style-satellite.json';

import type { DeckGLProps, DeckGLRef } from '@deck.gl/react/typed';
import type { H3HexagonLayer } from '@deck.gl/geo-layers/typed';
import type { ViewState as MapboxViewState } from 'react-map-gl/src/mapbox/mapbox';
import type { ComponentProps, Dispatch } from 'react';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

const MAP_STYLES = {
  terrain: DefaultMapStyle,
  satellite: SatelliteMapStyle,
};

export type MapStyle = keyof typeof MAP_STYLES;

export interface ViewState extends MapboxViewState {
  minZoom?: number;
  maxZoom?: number;
  transitionDuration?: number;
}

export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
};

export interface MapProps extends DeckGLProps {
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

const Map = React.forwardRef<DeckGLRef, MapProps>(
  (
    {
      children,
      mapStyle = 'terrain',
      viewState,
      initialViewState: partialInitialViewState,
      onViewStateChange,
      ...props
    },
    ref,
  ) => {
    const initialViewState = useMemo(
      () => ({
        ...INITIAL_VIEW_STATE,
        ...partialInitialViewState,
      }),
      [partialInitialViewState],
    );

    const [localViewState, setLocalViewState] = useState(() => ({
      ...initialViewState,
      ...viewState,
    }));

    return (
      <DeckGL
        ref={ref}
        initialViewState={viewState ? undefined : initialViewState}
        viewState={viewState}
        onViewStateChange={(state: Parameters<MapProps['onViewStateChange']>[0]) => {
          setLocalViewState(state.viewState);
          onViewStateChange?.(state);
        }}
        controller
        {...props}
      >
        <InteractiveMap
          viewState={viewState ?? localViewState}
          mapStyle={MAP_STYLES[mapStyle]}
          mapboxApiAccessToken={MAPBOX_API_TOKEN}
          className="-z-10"
        />
        {children}
      </DeckGL>
    );
  },
);

Map.displayName = 'Map';

export default Map;
