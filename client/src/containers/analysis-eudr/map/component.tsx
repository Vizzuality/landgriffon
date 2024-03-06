import { useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import Map from 'react-map-gl/maplibre';
import { type MapViewState } from '@deck.gl/core/typed';

import ZoomControl from './zoom';

import BasemapControl from '@/components/map/controls/basemap';
import { INITIAL_VIEW_STATE, MAP_STYLES } from '@/components/map';

import type { BasemapValue } from '@/components/map/controls/basemap/types';
import type { MapStyle } from '@/components/map/types';

const data = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const EUDRMap = () => {
  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  const layer: GeoJsonLayer = new GeoJsonLayer({
    id: 'geojson-layer',
    data,
    // Styles
    filled: true,
    pointRadiusMinPixels: 2,
    pointRadiusScale: 2000,
    getFillColor: [200, 0, 80, 180],
    // Interactive props
    pickable: true,
    autoHighlight: true,
  });

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

  return (
    <>
      <DeckGL
        viewState={{ ...viewState }}
        onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
        controller={{ dragRotate: false }}
        layers={[layer]}
      >
        <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} styleDiffing={false} />
      </DeckGL>
      <div className="absolute bottom-10 right-6 z-10 w-10 space-y-2">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl viewState={viewState} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </div>
    </>
  );
};

export default EUDRMap;
