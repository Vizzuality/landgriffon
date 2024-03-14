import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers/typed';
import Map from 'react-map-gl/maplibre';
import { WebMercatorViewport, MapView } from '@deck.gl/core/typed';
import { TileLayer } from '@deck.gl/geo-layers/typed';
import { CartoLayer, setDefaultCredentials, MAP_TYPES, API_VERSIONS } from '@deck.gl/carto/typed';
import bbox from '@turf/bbox';

import ZoomControl from './zoom';
import LegendControl from './legend';
import BasemapControl from './basemap';

import { useAppSelector } from '@/store/hooks';
// import { setBasemap, setPlanetCompare } from '@/store/features/eudr';
import { INITIAL_VIEW_STATE, MAP_STYLES } from '@/components/map';
import { usePlotGeometries } from '@/hooks/eudr';
import { formatNumber } from '@/utils/number-format';

import type { PickingInfo, MapViewState } from '@deck.gl/core/typed';

setDefaultCredentials({
  // apiBaseUrl: 'https://eudr.carto.com',
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  accessToken:
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjZDk0ZWIyZSJ9.oqLagnOEc-j7Z4hY-MTP1yoZA_vJ7WYYAkOz_NUmCJo',
});

const EUDRMap = () => {
  const { basemap, planetCompare, supplierLayer, contextualLayers } = useAppSelector(
    (state) => state.eudr,
  );

  const [hoverInfo, setHoverInfo] = useState<PickingInfo>(null);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  const plotGeometries = usePlotGeometries();

  // Supplier plot layer
  const layer: GeoJsonLayer = new GeoJsonLayer({
    id: 'full-plots-layer',
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
    visible: supplierLayer.active,
    onHover: setHoverInfo,
  });

  const planetLayer = new TileLayer({
    id: 'top-planet-monthly-layer',
    data: 'https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2020_12_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAK6679039df83f414faf798ba4ad4530db',
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

  const planetCompareLayer = new TileLayer({
    id: 'bottom-planet-monthly-layer',
    data: 'https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2024_02_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAK6679039df83f414faf798ba4ad4530db',
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

  const forestCoverLayer = new CartoLayer({
    id: 'full-forest-cover-2020-ec-jrc',
    type: MAP_TYPES.TILESET,
    connection: 'eudr',
    data: 'cartobq.eudr.JRC_2020_Forest_d_TILE',
    pointRadiusMinPixels: 2,
    getLineColor: [114, 169, 80],
    getFillColor: [114, 169, 80],
    lineWidthMinPixels: 1,
    visible: contextualLayers['forest-cover-2020-ec-jrc'].active,
    credentials: {
      apiVersion: API_VERSIONS.V3,
      apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
      accessToken:
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjY2JlMjUyYSJ9.LoqzuDp076ESVYmHm1mZNtfhnqOVGmSxzp60Fht8PQw',
    },
  });

  const deforestationLayer = new CartoLayer({
    id: 'full-deforestation-alerts-2020-2022-hansen',
    type: MAP_TYPES.QUERY,
    connection: 'eudr',
    data: 'SELECT * FROM `cartobq.eudr.TCL_hansen_year`',
    pointRadiusMinPixels: 2,
    getLineColor: [224, 191, 36],
    getFillColor: [224, 191, 36],
    lineWidthMinPixels: 1,
    visible: contextualLayers['deforestation-alerts-2020-2022-hansen'].active,
  });

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
        layers={[
          basemap === 'planet' && !planetCompare ? [planetLayer] : null,
          basemap === 'planet' && planetCompare ? [planetLayer, planetCompareLayer] : null,
          forestCoverLayer,
          deforestationLayer,
          layer,
        ]}
        layerFilter={({ layer, viewport }) => {
          return !planetCompare || viewport.id.startsWith(layer.id.split('-')[0]);
        }}
        onResize={handleResize}
        {...(planetCompare
          ? {
              views: [
                new MapView({
                  id: 'top',
                  y: 0,
                  height: '50%',
                  padding: { top: '100%' },
                }),
                new MapView({
                  id: 'bottom',
                  y: '50%',
                  height: '50%',
                  padding: { bottom: '100%' },
                }),
                new MapView({
                  id: 'full',
                  y: 0,
                  x: 0,
                  width: '100%',
                  height: '100%',
                }),
              ],
            }
          : {})}
      >
        <Map reuseMaps mapStyle={MAP_STYLES.terrain} styleDiffing={false} />
      </DeckGL>
      {planetCompare && (
        <div className="pointer-events-none absolute left-0 top-1/2 z-20 h-[2px] w-full bg-white" />
      )}
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
        <BasemapControl />
        <ZoomControl viewState={viewState} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        <LegendControl />
      </div>
    </>
  );
};

export default EUDRMap;
