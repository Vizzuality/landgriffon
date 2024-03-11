import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import Map from 'react-map-gl/maplibre';
import { WebMercatorViewport } from '@deck.gl/core/typed';
import bbox from '@turf/bbox';

import ZoomControl from './zoom';
import LegendControl from './legend';

import BasemapControl from '@/components/map/controls/basemap';
import { INITIAL_VIEW_STATE, MAP_STYLES } from '@/components/map';
import { usePlotGeometries } from '@/hooks/eudr';
import { formatNumber } from '@/utils/number-format';

import type { PickingInfo, MapViewState } from '@deck.gl/core/typed';
import type { BasemapValue } from '@/components/map/controls/basemap/types';
import type { MapStyle } from '@/components/map/types';

const EUDRMap = () => {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo>(null);
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
    onHover: setHoverInfo,
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
      {hoverInfo?.object && (
        <div
          className="pointer-events-none absolute z-10 max-w-32 rounded-md bg-white p-2 text-2xs shadow-md"
          style={{
            left: hoverInfo?.x + 10,
            top: hoverInfo?.y + 10,
          }}
        >
          <dl className="space-y-2">
            <div>
              <dt>Supplier: </dt>
              <dd className="font-semibold">{hoverInfo.object.properties.supplierName}</dd>
            </div>
            <div>
              <dt>Plot: </dt>
              <dd className="font-semibold">{hoverInfo.object.properties.plotName}</dd>
            </div>
            <div>
              <dt>Sourcing volume: </dt>
              <dd className="font-semibold">
                {formatNumber(hoverInfo.object.properties.baselineVolume)} t
              </dd>
            </div>
          </dl>
        </div>
      )}
      <div className="absolute bottom-10 right-6 z-10 w-10 space-y-2">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl viewState={viewState} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        <LegendControl />
      </div>
    </>
  );
};

export default EUDRMap;
