import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';

import Map from 'components/map';
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
  {
    id: 'h3-layer',
    type: 'deck',
    source: { parse: false },
    render: { parse: false },
    deck: [
      {
        id: 'h3-layer-demo',
        type: H3HexagonLayer,
        data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',
        pickable: true,
        wireframe: false,
        filled: true,
        extruded: true,
        elevationScale: 20,
        getHexagon: (d) => d.hex,
        getFillColor: (d) => [255, (1 - d.count / 500) * 255, 0],
        getElevation: (d) => d.count,
      },
    ],
  },
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
      <Map viewport={INITIAL_VIEW_STATE} mapboxApiAccessToken={MAPBOX_API_TOKEN}>
        {(map) => (
          <>
            <LayerManager map={map} plugin={PluginMapboxGl}>
              {layers.map((l) => (
                <Layer key={l.id} {...l} />
              ))}
            </LayerManager>
          </>
        )}
      </Map>
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
