import {
  useEffect, useState, useRef, useCallback, FC,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

import cx from 'classnames';

import isEmpty from 'lodash/isEmpty';

import ReactMapGL, {
  FlyToInterpolator,
  TRANSITION_EVENTS,
  ViewportProps,
} from 'react-map-gl';
import { InteractiveMapProps } from 'react-map-gl/src/components/interactive-map';

import { fitBounds } from '@math.gl/web-mercator';

import { easeCubic } from 'd3-ease';

export interface MapProps extends InteractiveMapProps {
  /** A function that returns the map instance */
  children?: React.ReactNode;

  /** Custom css class for styling */
  className?: string;

  /** An object that defines the viewport
   * @see https://uber.github.io/react-map-gl/#/Documentation/api-reference/interactive-map?section=initialization
   */
  viewport?: Partial<ViewportProps>;

  /** An object that defines the bounds */
  bounds?: {
    bbox: number[];
    options?: Record<string, unknown>;
    viewportOptions?: Partial<ViewportProps>;
  };

  /** A function that exposes when the map is mounted.
   * It receives and object with the `mapRef` and `mapContainerRef` reference. */
  onMapReady?: ({ map, mapContainer }) => void;

  /** A function that exposes when the map is loaded.
   * It receives and object with the `mapRef` and `mapContainerRef` reference. */
  onMapLoad?: ({ map, mapContainer }) => void;

  /** A function that exposes the viewport */
  onMapViewportChange?: (viewport: Partial<ViewportProps>) => void;
}

const DEFAULT_VIEWPORT = {
  zoom: 2,
  latitude: 0,
  longitude: 0,
};

export const Map: FC<MapProps> = ({
  mapboxApiAccessToken,
  children,
  className,
  viewport,
  bounds,
  onMapReady,
  onMapLoad,
  onMapViewportChange,
  dragPan,
  dragRotate,
  scrollZoom,
  touchZoom,
  touchRotate,
  doubleClickZoom,
  width = '100%',
  height = '100%',
  getCursor,
  ...mapboxProps
}: MapProps) => {
  /**
   * REFS
   */
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  /**
   * STATE
   */
  const [mapViewport, setViewport] = useState({
    ...DEFAULT_VIEWPORT,
    ...viewport,
  });
  const [flying, setFlight] = useState(false);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /**
   * CALLBACKS
   */
  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (onMapLoad) onMapLoad({ map: mapRef.current, mapContainer: mapContainerRef.current });
  }, [onMapLoad]);

  const debouncedOnMapViewportChange = useDebouncedCallback((v) => {
    onMapViewportChange(v);
  }, 250);

  const handleViewportChange = useCallback(
    (v) => {
      setViewport(v);
      debouncedOnMapViewportChange(v);
    },
    [debouncedOnMapViewportChange],
  );

  const handleResize = useCallback(
    (v) => {
      const newViewport = {
        ...mapViewport,
        ...v,
      };

      setViewport(newViewport);
      debouncedOnMapViewportChange(newViewport);
    },
    [mapViewport, debouncedOnMapViewportChange],
  );

  const handleFitBounds = useCallback(() => {
    if (!ready) return null;
    const { bbox, options = {}, viewportOptions = {} } = bounds;
    const { transitionDuration = 0 } = viewportOptions;

    if (
      mapContainerRef.current.offsetWidth <= 0
      || mapContainerRef.current.offsetHeight <= 0
    ) {
      console.error("mapContainerRef doesn't have dimensions");
      return null;
    }

    const { longitude, latitude, zoom } = fitBounds({
      width: mapContainerRef.current.offsetWidth,
      height: mapContainerRef.current.offsetHeight,
      bounds: [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      ...options,
    });

    const newViewport = {
      longitude,
      latitude,
      zoom,
      transitionDuration,
      transitionInterruption: TRANSITION_EVENTS.UPDATE,
      ...viewportOptions,
    };

    setFlight(true);
    setViewport((prevViewport) => ({
      ...prevViewport,
      ...newViewport,
    }));
    debouncedOnMapViewportChange(newViewport);

    return setTimeout(() => {
      setFlight(false);
    }, +transitionDuration);
  }, [ready, bounds, debouncedOnMapViewportChange]);

  const handleGetCursor = useCallback(({ isHovering, isDragging }) => {
    if (isHovering) return 'pointer';
    if (isDragging) return 'grabbing';
    return 'grab';
  }, []);

  /**
   * EFFECTS
   */
  useEffect(() => {
    setReady(true);
    if (onMapReady) onMapReady({ map: mapRef.current, mapContainer: mapContainerRef.current });
  }, [onMapReady]);

  useEffect(() => {
    if (!isEmpty(bounds) && !!bounds.bbox && bounds.bbox.every((b) => !!b)) {
      handleFitBounds();
    }
  }, [bounds, handleFitBounds]);

  useEffect(() => {
    setViewport((prevViewportState) => ({
      ...prevViewportState,
      ...viewport,
    }));
  }, [viewport]);

  return (
    <div
      ref={mapContainerRef}
      className={cx({
        'relative w-full h-full z-0': true,
        [className]: !!className,
      })}
    >
      <ReactMapGL
        ref={(_map) => {
          if (_map) {
            mapRef.current = _map.getMap();
          }
        }}
        mapboxApiAccessToken={mapboxApiAccessToken}
        // CUSTOM PROPS FROM REACT MAPBOX API
        {...mapboxProps}
        // VIEWPORT
        {...mapViewport}
        width={width}
        height={height}
        // INTERACTIVITY
        dragPan={!flying && dragPan}
        dragRotate={!flying && dragRotate}
        scrollZoom={!flying && scrollZoom}
        touchZoom={!flying && touchZoom}
        touchRotate={!flying && touchRotate}
        doubleClickZoom={!flying && doubleClickZoom}
        // DEFAULT FUNC IMPLEMENTATIONS
        onViewportChange={handleViewportChange}
        onResize={handleResize}
        onLoad={handleLoad}
        getCursor={getCursor || handleGetCursor}
        transitionInterpolator={new FlyToInterpolator()}
        transitionEasing={easeCubic}
      >
        {ready
          && loaded
          && !!mapRef.current
          && typeof children === 'function'
          && children(mapRef.current)}
      </ReactMapGL>
    </div>
  );
};

export default Map;
