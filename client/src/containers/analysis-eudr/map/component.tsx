import { useState, useCallback, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers/typed';
import Map from 'react-map-gl/maplibre';
import { MapView, WebMercatorViewport } from '@deck.gl/core/typed';
import { TileLayer } from '@deck.gl/geo-layers/typed';
import { CartoLayer, setDefaultCredentials, MAP_TYPES, API_VERSIONS } from '@deck.gl/carto/typed';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import bbox from '@turf/bbox';

import ZoomControl from './zoom';
import LegendControl from './legend';
import BasemapControl from './basemap';

import { useAppSelector } from '@/store/hooks';
import { INITIAL_VIEW_STATE, MAP_STYLES } from '@/components/map';
import { useEUDRData, usePlotGeometries } from '@/hooks/eudr';
import { formatNumber } from '@/utils/number-format';

import type { PickingInfo, MapViewState } from '@deck.gl/core/typed';

const monthFormatter = (date: string) => format(date, 'MM');

const MAX_BOUNDS = [-76.649412, -10.189886, -73.636411, -7.457082];

const DEFAULT_VIEW_STATE: MapViewState = {
  ...INITIAL_VIEW_STATE,
  latitude: -8.461844239054608,
  longitude: -74.96226240479487,
  zoom: 9,
  minZoom: 7,
  maxZoom: 20,
};

setDefaultCredentials({
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  accessToken:
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjZDk0ZWIyZSJ9.oqLagnOEc-j7Z4hY-MTP1yoZA_vJ7WYYAkOz_NUmCJo',
});

const EUDRMap = () => {
  const {
    basemap,
    planetLayer,
    planetCompareLayer,
    supplierLayer,
    contextualLayers,
    filters: { suppliers, materials, origins, plots, dates },
    table: { filters: tableFilters },
  } = useAppSelector((state) => state.eudr);

  const [hoverInfo, setHoverInfo] = useState<PickingInfo>(null);
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_VIEW_STATE);

  const params = useParams();

  const { data } = useEUDRData(
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
      producerIds: suppliers?.map(({ value }) => value),
      materialIds: materials?.map(({ value }) => value),
      originIds: origins?.map(({ value }) => value),
      geoRegionIds: plots?.map(({ value }) => value),
    },
    {
      select: (data) => {
        if (params?.supplierId) {
          return {
            dfs: data.table
              .filter((row) => row.supplierId === (params.supplierId as string))
              .map((row) => row.plots.dfs.flat())
              .flat(),
            sda: data.table
              .filter((row) => row.supplierId === (params.supplierId as string))
              .map((row) => row.plots.sda.flat())
              .flat(),
          };
        }

        const filteredData = data?.table.filter((dataRow) => {
          if (Object.values(tableFilters).every((filter) => !filter)) return true;

          if (tableFilters.dfs && dataRow.dfs > 0) return true;
          if (tableFilters.sda && dataRow.sda > 0) return true;
          if (tableFilters.tpl && dataRow.tpl > 0) return true;
        });

        return {
          dfs: filteredData.map((row) => row.plots.dfs.flat()).flat(),
          sda: filteredData.map((row) => row.plots.sda.flat()).flat(),
        };
      },
    },
  );

  const plotGeometries = usePlotGeometries({
    producerIds: params?.supplierId
      ? [params.supplierId as string]
      : suppliers?.map(({ value }) => value),
    materialIds: materials?.map(({ value }) => value),
    originIds: origins?.map(({ value }) => value),
    geoRegionIds: plots?.map(({ value }) => value),
  });

  const filteredGeometries: typeof plotGeometries.data = useMemo(() => {
    if (!plotGeometries.data || !data) return null;

    if (params?.supplierId) return plotGeometries.data;

    return {
      type: 'FeatureCollection',
      features: plotGeometries.data.features?.filter((feature) => {
        if (Object.values(tableFilters).every((filter) => !filter)) return true;

        if (tableFilters.dfs && data.dfs.indexOf(feature.properties.id) > -1) return true;
        if (tableFilters.sda && data.sda.indexOf(feature.properties.id) > -1) return true;
        return false;
      }),
    };
  }, [data, plotGeometries.data, tableFilters, params]);

  const eudrSupplierLayer = useMemo(() => {
    if (!filteredGeometries?.features || !data) return null;

    return new GeoJsonLayer<(typeof filteredGeometries)['features'][number]>({
      id: 'full-plots-layer',
      // @ts-expect-error will fix this later...
      data: filteredGeometries,
      // Styles
      filled: true,
      getFillColor: ({ properties }) => {
        if (data.dfs.indexOf(properties.id) > -1) return [74, 183, 243, 84];
        if (data.sda.indexOf(properties.id) > -1) return [255, 192, 56, 84];
        return [0, 0, 0, 84];
      },
      stroked: true,
      getLineColor: ({ properties }) => {
        if (data.dfs.indexOf(properties.id) > -1) return [74, 183, 243, 255];
        if (data.sda.indexOf(properties.id) > -1) return [255, 192, 56, 255];
        return [0, 0, 0, 84];
      },
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      // Interactive props
      pickable: true,
      autoHighlight: true,
      highlightColor: (x: PickingInfo) => {
        if (x.object?.properties?.id) {
          const {
            object: {
              properties: { id },
            },
          } = x;

          if (data.dfs.indexOf(id) > -1) return [74, 183, 243, 255];
          if (data.sda.indexOf(id) > -1) return [255, 192, 56, 255];
        }
        return [0, 0, 0, 84];
      },
      visible: supplierLayer.active,
      onHover: setHoverInfo,
      opacity: supplierLayer.opacity,
    });
  }, [filteredGeometries, data, supplierLayer.active, supplierLayer.opacity]);

  const basemapPlanetLayer = new TileLayer({
    id: 'top-planet-monthly-layer',
    data: `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${
      planetLayer.year
    }_${monthFormatter(
      planetLayer.month.toString(),
    )}_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAK6679039df83f414faf798ba4ad4530db`,
    minZoom: 0,
    maxZoom: 20,
    tileSize: 256,
    visible: planetLayer.active,
    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile as { bbox: { west: number; south: number; east: number; north: number } };

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  const basemapPlanetCompareLayer = new TileLayer({
    id: 'bottom-planet-monthly-layer',
    data: `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${
      planetCompareLayer.year
    }_${monthFormatter(
      planetCompareLayer.month.toString(),
    )}_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAK6679039df83f414faf798ba4ad4530db`,
    minZoom: 0,
    maxZoom: 20,
    tileSize: 256,
    visible: planetCompareLayer.active,
    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north },
      } = props.tile as { bbox: { west: number; south: number; east: number; north: number } };

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
    stroked: false,
    getFillColor: [114, 169, 80],
    lineWidthMinPixels: 1,
    opacity: contextualLayers['forest-cover-2020-ec-jrc'].opacity,
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
    data: 'SELECT * FROM `cartobq.eudr.TCL_hansen_year` WHERE year<=?',
    queryParameters: [contextualLayers['deforestation-alerts-2020-2022-hansen'].year],
    stroked: false,
    getFillColor: [224, 191, 36],
    lineWidthMinPixels: 1,
    opacity: contextualLayers['deforestation-alerts-2020-2022-hansen'].opacity,
    visible: contextualLayers['deforestation-alerts-2020-2022-hansen'].active,
    credentials: {
      apiVersion: API_VERSIONS.V3,
      apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
      accessToken:
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjZDk0ZWIyZSJ9.oqLagnOEc-j7Z4hY-MTP1yoZA_vJ7WYYAkOz_NUmCJo',
    },
  });

  const raddLayer = new CartoLayer({
    id: 'real-time-deforestation-alerts-since-2020-radd',
    type: MAP_TYPES.QUERY,
    connection: 'eudr',
    data: 'SELECT * FROM `cartobq.eudr.RADD_date_confidence_3` WHERE date BETWEEN ? AND ?',
    queryParameters: [
      contextualLayers['real-time-deforestation-alerts-since-2020-radd'].dateFrom,
      contextualLayers['real-time-deforestation-alerts-since-2020-radd'].dateTo,
    ],
    stroked: false,
    getFillColor: (d) => {
      const { confidence } = d.properties;
      if (confidence === 'Low') return [237, 164, 195];
      return [201, 42, 109];
    },
    lineWidthMinPixels: 1,
    opacity: contextualLayers['real-time-deforestation-alerts-since-2020-radd'].opacity,
    visible: contextualLayers['real-time-deforestation-alerts-since-2020-radd'].active,
    credentials: {
      apiVersion: API_VERSIONS.V3,
      apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
      accessToken:
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiI3NTFkNzA1YSJ9.jrVugV7HYfhmjxj-p2Iks8nL_AjHR91Q37JVP2fNmtc',
    },
  });

  const handleZoomIn = useCallback(() => {
    const zoom = viewState.maxZoom === viewState.zoom ? viewState.zoom : viewState.zoom + 1;
    setViewState({ ...viewState, zoom });
  }, [viewState]);

  const handleZoomOut = useCallback(() => {
    const zoom = viewState.maxZoom === viewState.zoom ? viewState.zoom : viewState.zoom - 1;
    setViewState({ ...viewState, zoom });
  }, [viewState]);

  useEffect(() => {
    if (!plotGeometries.data || !plotGeometries.isLoading) return;
    const dataBounds = bbox(plotGeometries.data);
    const newViewport = new WebMercatorViewport(viewState);
    if (newViewport) {
      const { latitude, longitude, zoom } = newViewport.fitBounds(
        [
          [dataBounds[0], dataBounds[1]],
          [dataBounds[2], dataBounds[3]],
        ],
        {
          padding: 10,
        },
      );
      setViewState({ ...viewState, latitude, longitude, zoom });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotGeometries.data, plotGeometries.isLoading]);

  return (
    <>
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
        <DeckGL
          viewState={{ ...viewState }}
          onViewStateChange={({ viewState }) => {
            viewState.longitude = Math.min(
              MAX_BOUNDS[2],
              Math.max(MAX_BOUNDS[0], viewState.longitude),
            );
            viewState.latitude = Math.min(
              MAX_BOUNDS[3],
              Math.max(MAX_BOUNDS[1], viewState.latitude),
            );
            setViewState(viewState as MapViewState);
          }}
          controller={{ dragRotate: false }}
          layers={[
            basemap === 'planet' && !planetCompareLayer.active ? [basemapPlanetLayer] : null,
            basemap === 'planet' && planetCompareLayer.active
              ? [basemapPlanetLayer, basemapPlanetCompareLayer]
              : null,
            forestCoverLayer,
            deforestationLayer,
            raddLayer,
            eudrSupplierLayer,
          ]}
          layerFilter={({ layer, viewport }) => {
            return !planetCompareLayer.active || viewport.id.startsWith(layer.id.split('-')[0]);
          }}
          {...(planetCompareLayer.active
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
        {planetCompareLayer.active && (
          <div className="pointer-events-none absolute left-0 top-1/2 z-20 h-[2px] w-full bg-white" />
        )}
      </div>
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
