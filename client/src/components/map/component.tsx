import React, { useEffect, useState, useCallback } from 'react';
import ReactMapGL, { useMap } from 'react-map-gl/maplibre';
import { useDebounce } from 'rooks';

import { INITIAL_VIEW_STATE, MAP_STYLES } from './constants';

import type { ViewState, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import type { FC } from 'react';
import type { CustomMapProps } from './types';

export const Map: FC<CustomMapProps> = ({
  id = 'default',
  mapStyle = 'terrain',
  initialViewState,
  viewState = {},
  bounds,
  onMapViewStateChange = () => null,
  children,
  dragPan,
  dragRotate,
  scrollZoom,
  doubleClickZoom,
  onLoad,
  sidebarCollapsed = false,
  touchZoomRotate, // not supported in MapLibre
  touchPitch, // not supported in MapLibre
  ...otherMapProps
}: CustomMapProps) => {
  /**
   * REFS
   */
  const { [id]: mapRef } = useMap();

  /**
   * STATE
   */
  const [localViewState, setLocalViewState] = useState<Partial<ViewState>>(
    !initialViewState && {
      ...INITIAL_VIEW_STATE,
      ...viewState,
    },
  );
  const onMapViewStateChangeDebounced = useDebounce(onMapViewStateChange, 150);

  const handleMapMove = useCallback(
    ({ viewState: _viewState }: ViewStateChangeEvent) => {
      setLocalViewState(_viewState);
      onMapViewStateChangeDebounced(_viewState);
    },
    [onMapViewStateChangeDebounced],
  );

  useEffect(() => {
    let resizeWhenCollapse: NodeJS.Timeout;

    // Cancel last timeout if a new one it triggered
    clearTimeout(resizeWhenCollapse);

    // Trigger the map resize if the sidebar has been collapsed. There is no need to resize if the sidebar has been expanded because the container will hide the excess width
    if (sidebarCollapsed) {
      resizeWhenCollapse = setTimeout(() => {
        mapRef?.resize();
      }, 150);
    }
  }, [sidebarCollapsed, mapRef]);

  return (
    <ReactMapGL
      id={id}
      mapStyle={MAP_STYLES[mapStyle]}
      initialViewState={initialViewState}
      onMove={handleMapMove}
      {...otherMapProps}
      {...localViewState}
      attributionControl
    >
      {!!mapRef && children(mapRef.getMap())}
    </ReactMapGL>
  );
};

Map.displayName = 'Map';

export default Map;
