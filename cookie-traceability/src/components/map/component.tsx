import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import Flag from 'react-country-flag';
import axios from 'axios';
import DeckGL from '@deck.gl/react/typed';
import { Map as ReactMapGl, Layer } from 'react-map-gl';
import { ScatterplotLayer } from '@deck.gl/layers/typed';
import numeral from 'numeral';
import { flip, offset, useFloating } from '@floating-ui/react-dom';

import { FlowMapLayer } from 'lib/flowmap/layers';

import { INGREDIENTS, MAPBOX_TOKEN, INITIAL_VIEW_STATE, NUMERAL_FORMAT } from '../../constants';
import mapStyle from './map-style.json';

import type { LayerProps as ReactMapGlLayers } from 'react-map-gl';
import type { LocationDatum, FlowDatum, Ingredient } from 'types';
import type { MapProps, MapFlowData } from './types';

const fetchData = async (dataPath: string) => axios.get(dataPath).then((res) => res.data);

const DEFAULT_QUERY_OPTIONS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
};

const Map: React.FC<MapProps> = ({ ingredientId, currentTradeFlow }) => {
  const queryClient = useQueryClient();
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const { x, y, reference, floating, strategy } = useFloating({
    middleware: [flip(), offset(10)],
    placement: 'top',
    strategy: 'absolute',
  });

  const ingredient = useMemo<Ingredient>(
    () => INGREDIENTS.find((i) => i.id === ingredientId) || INGREDIENTS[0],
    [ingredientId],
  );
  const results = useQueries({
    queries: [
      {
        queryKey: ['flows', ingredientId],
        queryFn: fetchData.bind(this, ingredient?.dataFlowPath),
        ...DEFAULT_QUERY_OPTIONS,
      },
      {
        queryKey: ['locations', ingredientId],
        queryFn: fetchData.bind(this, ingredient?.dataLocationsPath),
        ...DEFAULT_QUERY_OPTIONS,
      },
    ],
  });
  const data = useMemo<MapFlowData>(() => {
    if (results[0].data && results[1].data) {
      let flows = results[0].data;
      // TO-DO: this should be better in a select on Query
      if (currentTradeFlow) {
        const exporterId = results[1].data.find(
          (d: LocationDatum) => d.name === currentTradeFlow.exporter,
        )?.id;
        const importerId = results[1].data.find(
          (d: LocationDatum) => d.name === currentTradeFlow.importer,
        )?.id;
        flows = results[0].data.filter(
          (flow: FlowDatum) => flow.origin === exporterId && flow.dest === importerId,
        );
      }
      return {
        flows,
        locations: results[1].data,
      };
    }
    return null;
  }, [currentTradeFlow, results]);

  const countryISOs = useMemo<string[]>(() => {
    if (data?.locations && currentTradeFlow) {
      return data.locations
        .filter(
          (loc) => loc.name === currentTradeFlow.exporter || loc.name === currentTradeFlow.importer,
        )
        .map((loc) => loc.iso2)
        .filter((iso) => !!iso);
    }
    if (data?.locations) return data.locations.map((loc) => loc.iso2).filter((iso) => !!iso);
    return [];
  }, [currentTradeFlow, data?.locations]);

  const locationsFiltered = useMemo<LocationDatum[]>(() => {
    if (currentTradeFlow) {
      return (
        data?.locations.filter(
          (loc) => loc.name === currentTradeFlow.exporter || loc.name === currentTradeFlow.importer,
        ) || []
      );
    }
    return data?.locations || [];
  }, [currentTradeFlow, data?.locations]);

  const exporters = useMemo(() => {
    if (hoverInfo?.object) {
      const result = data?.flows
        .filter((flow) => flow.origin === hoverInfo.object.id)
        .map((flow) => {
          const location = data?.locations.find((loc) => loc.id === flow.dest);
          return {
            ...flow,
            countryName: location?.name,
          };
        });
      return result;
    }
    return null;
  }, [data, hoverInfo]);

  const importers = useMemo(() => {
    if (hoverInfo?.object) {
      const result = data?.flows
        .filter((flow) => flow.dest === hoverInfo.object.id)
        .map((flow) => {
          const location = data?.locations.find((loc) => loc.id === flow.origin);
          return {
            ...flow,
            countryName: location?.name,
          };
        });
      return result;
    }
    return null;
  }, [data, hoverInfo]);

  const highlightedCountriesBoundaries: ReactMapGlLayers = {
    id: 'country-highlight-layer',
    type: 'line',
    source: 'composite',
    'source-layer': 'country_boundaries',
    filter: ['in', 'iso_3166_1', ...countryISOs],
    paint: {
      'line-color': '#C54C39',
      'line-opacity': 0.8,
      'line-width': 2,
    },
  };

  const highlightedCountriesLabels: ReactMapGlLayers = {
    id: 'country-label',
    minzoom: 1,
    layout: {
      'text-line-height': 1.1,
      'text-size': [
        'interpolate',
        ['cubic-bezier', 0.2, 0, 0.7, 1],
        ['zoom'],
        1,
        ['step', ['get', 'symbolrank'], 11, 4, 9, 5, 8],
        9,
        ['step', ['get', 'symbolrank'], 22, 4, 19, 5, 17],
      ],
      'text-radial-offset': ['step', ['zoom'], 0.6, 8, 0],
      'icon-image': '',
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
      'text-field': ['coalesce', ['get', 'name_en'], ['get', 'name']],
      'text-max-width': 6,
    },
    maxzoom: 10,
    filter: ['in', 'iso_3166_1', ...countryISOs],
    type: 'symbol',
    source: 'composite',
    paint: {
      'icon-opacity': ['step', ['zoom'], ['case', ['has', 'text_anchor'], 1, 0], 7, 0],
      'text-color': 'hsla(8, 55%, 50%, 0.8)',
    },
    'source-layer': 'place_label',
    metadata: {
      'mapbox:featureComponent': 'place-labels',
      'mapbox:group': 'Place labels, place-labels',
    },
  };

  // Layers for the map, there is not penalty for having an empty array
  const layers: any[] = [];
  if (data) {
    layers.push(
      new FlowMapLayer<LocationDatum, FlowDatum>({
        id: 'countries-tradings-layer',
        data,
        darkMode: false,
        animationEnabled: true,
        colorScheme: 'Custom',
        clusteringEnabled: false,
        pickable: false,
        fadeEnabled: false,
        fadeOpacityEnabled: false,
        adaptiveScalesEnabled: true,
        locationTotalsEnabled: false,
        locationLabelsEnabled: false,
        getLocationId: (loc) => loc.id,
        getFlowOriginId: (flow) => flow.origin,
        getLocationName: (loc) => loc.name,
        getFlowDestId: (flow) => flow.dest,
        getFlowMagnitude: (flow) => flow.count,
        getLocationCentroid: (loc) => [loc.lon, loc.lat],
      }),
    );
    layers.push(
      new ScatterplotLayer<LocationDatum>({
        id: 'trading-locations-layer',
        data: locationsFiltered,
        pickable: true,
        opacity: 1,
        stroked: false,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 4,
        radiusMaxPixels: 10,
        lineWidthMinPixels: 1,
        getPosition: (d) => [d.lon, d.lat],
        getRadius: 100,
        getFillColor: [0, 0, 0],
        onHover: (info) => setHoverInfo(info),
      }),
    );
  }

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['flows'] });
  }, [currentTradeFlow, queryClient]);

  return (
    <div className="relative w-full h-[630px]">
      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        layers={layers}
        controller={false}
      >
        <ReactMapGl
          projection="mercator"
          mapStyle={JSON.parse(JSON.stringify(mapStyle))}
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <Layer {...highlightedCountriesLabels} />
          <Layer {...highlightedCountriesBoundaries} />
        </ReactMapGl>
        {hoverInfo?.object && (
          <div
            className="absolute z-10"
            style={{
              left: hoverInfo.x,
              top: hoverInfo.y,
            }}
            ref={reference}
          >
            <div
              className="px-4 py-3 rounded-md pointer-events-none text-secondary bg-gray-dark"
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
              }}
            >
              <h3 className="flex items-center space-x-2 text-sm font-medium font-display">
                <Flag countryCode={hoverInfo.object.iso2} svg />
                <span>{hoverInfo.object.name}</span>
              </h3>
              <ul className="mt-2 space-y-1">
                {importers &&
                  importers.map((importer) => (
                    <li
                      key={`tooltip-item-${importer.origin}-${importer.dest}`}
                      className="flex justify-between space-x-4 text-xs"
                    >
                      <div className="whitespace-nowrap">
                        {importer.countryName} &rarr; {hoverInfo.object.name}{' '}
                      </div>
                      <div className="whitespace-nowrap">
                        {numeral(importer.count).format(NUMERAL_FORMAT)} tonnes
                      </div>
                    </li>
                  ))}
                {exporters &&
                  exporters.map((exporter) => (
                    <li
                      key={`tooltip-item-${exporter.origin}-${exporter.dest}`}
                      className="flex justify-between space-x-4 text-xs"
                    >
                      <div className="whitespace-nowrap">
                        {hoverInfo.object.name} &rarr; {exporter.countryName}
                      </div>
                      <div className="whitespace-nowrap">
                        {numeral(exporter.count).format(NUMERAL_FORMAT)} tonnes
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </DeckGL>
    </div>
  );
};

export default Map;
