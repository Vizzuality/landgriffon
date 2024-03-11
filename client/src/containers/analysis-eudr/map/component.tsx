import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers/typed';
import Map from 'react-map-gl/maplibre';
import { WebMercatorViewport, View, MapView } from '@deck.gl/core/typed';
import { TileLayer } from '@deck.gl/geo-layers/typed';
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

const PlanetQ32023_ID = 'PlanetQ32023';
const PlanetQ32019_ID = 'PlanetQ32019';
const DEFORESTATION_QUADBIN_LAYER_ID = 'deforestationQuadbinLayer';

const EUDRMap = () => {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  const plotGeometries = usePlotGeometries();

  const layer: GeoJsonLayer = new GeoJsonLayer({
    id: 'top-plots-layer',
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

  const layer2: GeoJsonLayer = new GeoJsonLayer({
    id: 'bottom-plots-layer',
    data: plotGeometries.data,
    // Styles
    filled: true,
    getFillColor: [255, 0, 0, 255],
    stroked: true,
    getLineColor: [255, 0, 0, 255],
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    // Interactive props
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 176, 0, 255],
    onHover: setHoverInfo,
  });

  const planetQ32019Layer = new TileLayer({
    // id: PlanetQ32023_ID,
    id: 'top-planet-q3-2019-layer',
    data: 'https://tiles.planet.com/basemaps/v1/planet-tiles/global_quarterly_2019q3_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAK6679039df83f414faf798ba4ad4530db',
    minZoom: 0,
    maxZoom: 20,
    tileSize: 256,
    visible: true,
    // onTileLoad: (data) => {
    //   dispatch(
    //     updateLayer({
    //       id: PlanetQ32023_ID,
    //       layerAttributes: { ...layerConfig },
    //     })
    //   );
    //   //cartoLayerProps.onDataLoad(data);
    // },
    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  const planetQ32023Layer = new TileLayer({
    // id: PlanetQ32023_ID,
    id: 'bottom-planet-q3-2023-layer',
    data: 'https://tiles.planet.com/basemaps/v1/planet-tiles/global_quarterly_2023q3_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAK6679039df83f414faf798ba4ad4530db',
    minZoom: 0,
    maxZoom: 20,
    tileSize: 256,
    visible: true,
    // onTileLoad: (data) => {
    //   dispatch(
    //     updateLayer({
    //       id: PlanetQ32023_ID,
    //       layerAttributes: { ...layerConfig },
    //     })
    //   );
    //   //cartoLayerProps.onDataLoad(data);
    // },
    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  const layers = [planetQ32019Layer, planetQ32023Layer, layer, layer2];

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
        layerFilter={({ layer, viewport }) => viewport.id.startsWith(layer.id.split('-')[0])}
        onResize={handleResize}
        views={[
          new MapView({
            id: 'full',
            controller: true,
          }),
          new MapView({
            id: 'top',
            y: 0,
            height: '50%',
            padding: { top: '100%' },
            controller: true,
          }),
          new MapView({
            id: 'bottom',
            y: '50%',
            height: '50%',
            padding: { bottom: '100%' },
            // controller: true,
          }),
        ]}
      >
        <View id="full">
          <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} styleDiffing={false} />
        </View>
        <View id="top" />
        <View id="bottom" />
        {/* <Map reuseMaps mapStyle={MAP_STYLES[mapStyle]} styleDiffing={false} /> */}
        {/* <View id="bottom" /> */}
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
