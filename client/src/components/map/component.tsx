import React, { useEffect, useState, useCallback } from 'react';
import ReactMapGL, { useMap } from 'react-map-gl';
import { useDebouncedCallback } from 'use-debounce';

import { DEFAULT_VIEW_STATE, MAP_STYLES } from './constants';

import type { ViewState, ViewStateChangeEvent } from 'react-map-gl';
import type { FC } from 'react';
import type { CustomMapProps } from './types';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  padding: null,
};

export const Map: FC<CustomMapProps> = ({
  id = 'default',
  mapStyle = 'terrain',
  initialViewState,
  viewState = {},
  bounds,
  onMapViewStateChange,
  children,
  dragPan,
  dragRotate,
  scrollZoom,
  doubleClickZoom,
  ...mapboxProps
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
      ...DEFAULT_VIEW_STATE,
      ...viewState,
    },
  );
  const [isFlying, setFlying] = useState(false);

  /**
   * CALLBACKS
   */
  const debouncedViewStateChange = useDebouncedCallback((_viewState: ViewState) => {
    onMapViewStateChange?.(_viewState);
  }, 150);

  const handleFitBounds = useCallback(() => {
    const { bbox, options } = bounds;

    // enabling fly mode avoids the map to be interrupted during the bounds transition
    setFlying(true);

    mapRef.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      options,
    );
  }, [bounds, mapRef]);

  const handleMapMove = useCallback(
    ({ viewState: _viewState }: ViewStateChangeEvent) => {
      setLocalViewState(_viewState);
      debouncedViewStateChange(_viewState);
    },
    [debouncedViewStateChange],
  );

  useEffect(() => {
    if (mapRef && bounds) {
      handleFitBounds();
    }
  }, [mapRef, bounds, handleFitBounds]);

  useEffect(() => {
    setLocalViewState((prevViewState) => ({
      ...prevViewState,
      ...viewState,
    }));
  }, [viewState]);

  useEffect(() => {
    if (!bounds) return undefined;

    const { options } = bounds;
    const animationDuration = options?.duration || 0;
    let timeoutId: number = null;

    if (isFlying) {
      timeoutId = window.setTimeout(() => {
        setFlying(false);
      }, animationDuration);
    }

    return () => {
      if (timeoutId) {
        window.clearInterval(timeoutId);
      }
    };
  }, [bounds, isFlying]);

  return (
    <ReactMapGL
      id={id}
      mapStyle={MAP_STYLES[mapStyle]}
      initialViewState={initialViewState}
      mapboxAccessToken={MAPBOX_API_TOKEN}
      dragPan={!isFlying && dragPan}
      dragRotate={!isFlying && dragRotate}
      scrollZoom={!isFlying && scrollZoom}
      doubleClickZoom={!isFlying && doubleClickZoom}
      onMove={handleMapMove}
      className="-z-10"
      {...mapboxProps}
      {...localViewState}
    >
      {!!mapRef && children(mapRef.getMap())}
    </ReactMapGL>
  );
};

Map.displayName = 'Map';

export default Map;
