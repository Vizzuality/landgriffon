import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import Map from 'react-map-gl/maplibre';
import { WebMercatorViewport, type MapViewState } from '@deck.gl/core/typed';
import bbox from '@turf/bbox';

import ZoomControl from './zoom';
import LegendControl from './legend';

import BasemapControl from '@/components/map/controls/basemap';
import { INITIAL_VIEW_STATE, MAP_STYLES } from '@/components/map';
import { usePlotGeometries } from '@/hooks/eudr';

import type { BasemapValue } from '@/components/map/controls/basemap/types';
import type { MapStyle } from '@/components/map/types';

const EUDRMap = () => {
  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  const plotGeometries = usePlotGeometries();

  const layer: GeoJsonLayer = new GeoJsonLayer({
    id: 'geojson-layer',
    data: plotGeometries.data,
    // Styles
    filled: true,
    getFillColor: [255, 176, 0, 84],
    stroked: true,
    getLineColor: [255, 176, 0, 255],
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    // Interactive props
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 176, 0, 255],
  });

  const layers = [layer];

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

  const handleZoomIn = useCallback(() => {
    const zoom = viewState.maxZoom === viewState.zoom ? viewState.zoom : viewState.zoom + 1;
    setViewState({ ...viewState, zoom });
  }, [viewState]);

  const handleZoomOut = useCallback(() => {
    const zoom = viewState.maxZoom === viewState.zoom ? viewState.zoom : viewState.zoom - 1;
    setViewState({ ...viewState, zoom });
  }, [viewState]);

  const fitToPlotBounds = useCallback(() => {
    if (!plotGeometries.data) return;
    const [minLng, minLat, maxLng, maxLat] = bbox(plotGeometries.data);
    const newViewport = new WebMercatorViewport(viewState);
    const { longitude, latitude, zoom } = newViewport.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 10,
      },
    );
    if (
      viewState.latitude !== latitude ||
      viewState.longitude !== longitude ||
      viewState.zoom !== zoom
    ) {
      setViewState({ ...viewState, longitude, latitude, zoom });
    }
  }, [plotGeometries.data, viewState]);

  // Fit to bounds when data is loaded or changed
  useEffect(() => {
    if (plotGeometries.data) {
      fitToPlotBounds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotGeometries.data]);

  const handleResize = useCallback(() => {
    setTimeout(() => fitToPlotBounds(), 0);
  }, [fitToPlotBounds]);

  return (
    <>
      <DeckGL
        viewState={{ ...viewState }}
        onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
        controller={{ dragRotate: false }}
        layers={layers}
        onResize={handleResize}
      >
        <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} styleDiffing={false} />
      </DeckGL>
      <div className="absolute bottom-10 right-6 z-10 w-10 space-y-2">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl viewState={viewState} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        <LegendControl />
      </div>
    </>
  );
};

export default EUDRMap;
