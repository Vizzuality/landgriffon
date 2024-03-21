import { useState, useCallback, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react/typed';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import Map, { useMap, Source, Layer } from 'react-map-gl/maplibre';
import { WebMercatorViewport } from '@deck.gl/core/typed';
import MapLibreCompare from '@maplibre/maplibre-gl-compare';
import { CartoLayer, MAP_TYPES, API_VERSIONS } from '@deck.gl/carto/typed';
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
const friendlyMonthFormatter = (date: string) => format(date, 'MMM');

const MAX_BOUNDS = [-75.76238126131099, -9.1712425377296, -74.4412398476887, -7.9871587484823845];

const DEFAULT_VIEW_STATE: MapViewState = {
  ...INITIAL_VIEW_STATE,
  latitude: -8.461844239054608,
  longitude: -74.96226240479487,
  zoom: 9,
  minZoom: 7,
  maxZoom: 20,
};

const EUDRCompareMap = () => {
  const maps = useMap();

  const {
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
      features: plotGeometries.data.features.filter((feature) => {
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
      accessToken: process.env.NEXT_PUBLIC_CARTO_FOREST_ACCESS_TOKEN,
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
      accessToken: process.env.NEXT_PUBLIC_CARTO_DEFORESTATION_ACCESS_TOKEN,
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
      accessToken: process.env.NEXT_PUBLIC_CARTO_RADD_ACCESS_TOKEN,
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
    if (plotGeometries.data?.features?.length === 0 || plotGeometries.isLoading) {
      return;
    }
    setTimeout(() => {
      const newViewport = new WebMercatorViewport({ ...viewState, width: 800, height: 600 });
      const dataBounds = bbox(plotGeometries.data);
      const newViewState = newViewport.fitBounds(
        [
          [dataBounds[0], dataBounds[1]],
          [dataBounds[2], dataBounds[3]],
        ],
        {
          padding: 50,
        },
      );
      const { latitude, longitude, zoom } = newViewState;
      setViewState({ ...viewState, latitude, longitude, zoom });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotGeometries.data, plotGeometries.isLoading]);

  useEffect(() => {
    if (!maps.afterMap || !maps.beforeMap) return;
    const map = new MapLibreCompare(maps.beforeMap, maps.afterMap, '#comparison-container', {
      orientation: 'horizontal',
    });
    return () => map?.remove();
  }, [maps.afterMap, maps.beforeMap]);

  return (
    <>
      <div className="absolute left-0 top-0 h-full w-full" id="comparison-container">
        <DeckGL
          id="deckMainMap"
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
          layers={[forestCoverLayer, deforestationLayer, raddLayer, eudrSupplierLayer]}
        >
          <Map
            id="beforeMap"
            mapStyle={MAP_STYLES.terrain}
            style={{
              position: 'absolute',
            }}
          >
            <div className="pointer-events-none absolute left-10 top-10 z-10 rounded-sm border border-navy-400 bg-white px-2 py-1 text-2xs text-navy-400">
              {`${planetLayer.year} ${friendlyMonthFormatter(planetLayer.month.toString())}`}
            </div>
            <Source
              type="raster"
              tiles={[
                `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${
                  planetLayer.year
                }_${monthFormatter(
                  planetLayer.month.toString(),
                )}_mosaic/gmap/{z}/{x}/{y}.png?api_key=${process.env.NEXT_PUBLIC_PLANET_API_KEY}`,
              ]}
              tileSize={256}
            >
              <Layer id="monthlyPlanetLAyer" type="raster" />
            </Source>
          </Map>
          <Map id="afterMap" mapStyle={MAP_STYLES.terrain} style={{ position: 'absolute' }}>
            <div className="pointer-events-none absolute bottom-10 left-10 z-10 rounded-sm border border-navy-400 bg-white px-2 py-1 text-2xs text-navy-400">
              {`${planetCompareLayer.year} ${friendlyMonthFormatter(
                planetCompareLayer.month.toString(),
              )}`}
            </div>
            <Source
              type="raster"
              tiles={[
                `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${
                  planetCompareLayer.year
                }_${monthFormatter(
                  planetCompareLayer.month.toString(),
                )}_mosaic/gmap/{z}/{x}/{y}.png?api_key=${process.env.NEXT_PUBLIC_PLANET_API_KEY}`,
              ]}
              tileSize={256}
            >
              <Layer id="monthlyPlanetLAyer" type="raster" />
            </Source>
          </Map>
        </DeckGL>
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

export default EUDRCompareMap;