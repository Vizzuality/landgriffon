import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import DeckGL from '@deck.gl/react/typed';
import { Map as ReactMapGl } from 'react-map-gl';
import { FlowMapLayer } from 'lib/flowmap/layers';

import { INGREDIENTS, MAPBOX_TOKEN, INITIAL_VIEW_STATE } from '../../constants';
import mapStyle from './map-style.json';

import type { LocationDatum, FlowDatum, Ingredient } from 'types';
import type { MapProps } from './types';

// const colors = {
//   flows: {
//     scheme: [
//       'rgb(0, 22, 61)',
//       'rgb(0, 27, 62)',
//       'rgb(0, 36, 68)',
//       'rgb(0, 48, 77)',
//       'rgb(3, 65, 91)',
//       'rgb(48, 87, 109)',
//       'rgb(85, 115, 133)',
//       'rgb(129, 149, 162)',
//       'rgb(179, 191, 197)',
//       'rgb(240, 240, 240)',
//     ],
//   },
//   locationAreas: {
//     normal: '#334',
//   },
//   outlineColor: '#000',
// };

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
  const data = useMemo(() => {
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
        colorScheme: 'Greys',
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

  return (
    <div className="relative w-full h-[760px]">
      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        layers={layers}
        controller={true}
      >
        <ReactMapGl
          projection="mercator"
          interactive={false}
          mapStyle={JSON.parse(JSON.stringify(mapStyle))}
          mapboxAccessToken={MAPBOX_TOKEN}
          renderWorldCopies={false}
        />
      </DeckGL>
    </div>
  );
};

export default Map;
