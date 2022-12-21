import React, { useEffect, useMemo } from 'react';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import axios from 'axios';
import DeckGL from '@deck.gl/react/typed';
import { Map as ReactMapGl, Layer } from 'react-map-gl';
import { FlowMapLayer } from 'lib/flowmap/layers';

import { INGREDIENTS, MAPBOX_TOKEN, INITIAL_VIEW_STATE } from '../../constants';
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
    if (data?.locations) return data.locations.map((loc) => loc.iso2).filter((iso) => !!iso);
    return [];
  }, [data]);

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
        pickable: true,
        fadeEnabled: false,
        fadeOpacityEnabled: false,
        adaptiveScalesEnabled: true,
        locationTotalsEnabled: true,
        getLocationId: (loc) => loc.id,
        getFlowOriginId: (flow) => flow.origin,
        getLocationName: (loc) => loc.name,
        getFlowDestId: (flow) => flow.dest,
        getFlowMagnitude: (flow) => flow.count,
        getLocationCentroid: (loc) => [loc.lon, loc.lat],
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
      </DeckGL>
    </div>
  );
};

export default Map;
