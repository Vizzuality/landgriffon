import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import DeckGL from '@deck.gl/react/typed';
import { Map as ReactMapGl, Source, Layer } from 'react-map-gl';
import { FlowMapLayer } from 'lib/flowmap/layers';

import { INGREDIENTS, MAPBOX_TOKEN, INITIAL_VIEW_STATE } from '../../constants';
import mapStyle from './map-style.json';

import type { LayerProps } from 'react-map-gl';
import type { LocationDatum, FlowDatum, Ingredient } from 'types';
import type { MapProps, MapFlowData } from './types';

const fetchData = async (dataPath: string) => axios.get(dataPath).then((res) => res.data);

const DEFAULT_QUERY_OPTIONS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
};

const Map: React.FC<MapProps> = ({ ingredientId }) => {
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
      return {
        flows: results[0].data,
        locations: results[1].data,
      };
    }
    return null;
  }, [results]);

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

  const countryNames = useMemo<string[]>(() => {
    if (data?.locations) return data.locations.map((loc) => loc.name);
    return [];
  }, [data]);

  const parkLayer: LayerProps = {
    id: 'country-highlight-layer',
    type: 'line',
    'source-layer': 'country_boundaries',
    // filter: ['in', 'iso_3166_1_alpha_3', 'ITA', 'NLD', 'DEU', 'FRA', 'ESP', 'GBR', 'USA'],
    filter: ['in', 'name_en', ...countryNames],
    paint: {
      'line-color': '#C54C39',
      'line-opacity': 0.5,
      'line-width': 2,
    },
  };

  return (
    <div className="relative w-full h-[630px]">
      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        layers={layers}
        controller={true}
      >
        <ReactMapGl
          projection="mercator"
          mapStyle={JSON.parse(JSON.stringify(mapStyle))}
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <Source type="vector" url="mapbox://mapbox.country-boundaries-v1">
            <Layer {...parkLayer} />
          </Source>
        </ReactMapGl>
      </DeckGL>
    </div>
  );
};

export default Map;
