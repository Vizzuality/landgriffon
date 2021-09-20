import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

const layers = [
  new H3HexagonLayer({
    id: 'h3-hexagon-layer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 20,
    getHexagon: (d) => d.hex,
    getFillColor: (d) => [255, (1 - d.count / 500) * 255, 0],
    getElevation: (d) => d.count,
  }),
];

const AnalysisMap: React.FC = () => {
  const mockedLayers = [
    {
      id: 'choropleth-example-1',
      name: 'Choropleth example',
      icon: null,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      type: 'choropleth',
      legendConfig: {
        items: [
          {
            value: '0',
            color: '#FFFFFF',
          },
          {
            color: '#C0F09C',
            value: '1',
          },
          {
            color: '#E3DA64',
            value: '2',
          },
          {
            color: '#D16638',
            value: '3',
          },
          {
            color: '#BA2D2F',
            value: '6',
          },
          {
            color: '#A11F4A',
            value: '12',
          },
          {
            color: '#730D6F',
            value: '24',
          },
          {
            color: '#0D0437',
            value: '48',
          },
        ],
      },
    },
  ];

  const legendItems = mockedLayers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    ...(layer.legendConfig || {}),
  }));

  return (
    <>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller layers={layers}>
        <StaticMap mapboxApiAccessToken={MAPBOX_API_TOKEN} />
      </DeckGL>
      <Legend
        className="absolute z-10 bottom-10 right-10 w-72"
        maxHeight={400}
        onChangeOrder={() => {}}
      >
        {legendItems.map((i) => (
          <LegendItem key={i.id} {...i}>
            <LegendTypeChoropleth className="text-sm text-gray-300" items={i.items} />
          </LegendItem>
        ))}
      </Legend>
    </>
  );
};

export default AnalysisMap;
