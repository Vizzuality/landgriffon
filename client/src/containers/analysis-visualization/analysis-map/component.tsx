import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';
import { format } from 'd3-format';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { StaticMap } from 'react-map-gl';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import Loading from 'components/loading';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};
const BUCKETS = 6;
const COLORS_RANGE = ['#fafa6e', '#2A4858'];
const COLORS = chroma.scale(COLORS_RANGE).mode('lch').colors(BUCKETS, 'rgb');
const COLORS_LEGEND = chroma.scale(COLORS_RANGE).mode('lch').colors(BUCKETS, 'hex');
const NUMBER_FORMAT = format('.2f');
const TEMP_H3_DATA = {
  impact:
    'https://api.landgriffon.com/api/v1/h3/material?materialId=bb5f553a-7056-4efa-995e-546bc7e458a6&resolution=4',
  risk: 'https://api.landgriffon.com/api/v1/h3/risk-map?indicatorId=1224d1d9-c3ae-450f-acb6-67f4ed33b5f7&materialId=bb5f553a-7056-4efa-995e-546bc7e458a6&year=2000&resolution=4',
  material:
    'https://api.landgriffon.com/api/v1/h3/material?materialId=bb5f553a-7056-4efa-995e-546bc7e458a6&resolution=4',
};

const AnalysisMap: React.FC = () => {
  const { dataset } = useAppSelector(analysis);
  const [layers, setLayers] = useState([]);
  const [legendItems, setLegendItems] = useState([]);
  const [isRendering, setIsRendering] = useState(false);
  const { data, isFetching } = useQuery(
    ['h3-data', dataset],
    () => axios.get(TEMP_H3_DATA[dataset]).then((response) => response.data),
    { placeholderData: [], refetchOnWindowFocus: false }
  );
  const handleAfterRender = useCallback(() => setIsRendering(false), []);

  useEffect(() => {
    setIsRendering(true);

    if (data && !isFetching) {
      const { metadata, data: h3Data } = data;
      const domainValues: number[] = Object.values(metadata.quantiles);
      const scale = scaleThreshold().domain(domainValues).range(COLORS);
      const h3DataWithColor = h3Data.map((d) => ({ ...d, c: scale(d.v) }));

      setLayers([
        new H3HexagonLayer({
          id: 'h3-layer',
          data: h3DataWithColor,
          pickable: true,
          wireframe: false,
          filled: true,
          extruded: true,
          elevationScale: 1,
          highPrecision: false,
          getHexagon: (d) => d.h,
          getFillColor: (d) => d.c,
          getElevation: (d) => d.v,
        }),
      ]);

      setLegendItems([
        {
          id: 'h3-legend',
          items: domainValues.map((v, index) => ({
            value: NUMBER_FORMAT(v),
            color: COLORS_LEGEND[index],
          })),
        },
      ]);
    }
  }, [data, isFetching]);

  return (
    <>
      {(isFetching || isRendering) && (
        <div className="absolute w-full h-full bg-black bg-opacity-40 backdrop-blur-sm z-10 flex justify-center items-center">
          <Loading className="relative w-10 h-10" />
        </div>
      )}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        layers={layers}
        onAfterRender={handleAfterRender}
        getTooltip={({ object }) =>
          object && {
            html: `<div>${object.v}</div>`,
            style: {
              backgroundColor: '#222',
              fontSize: '0.8em',
            },
          }
        }
      >
        <StaticMap
          mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
          mapboxApiAccessToken={MAPBOX_API_TOKEN}
        />
      </DeckGL>
      <Legend
        className="absolute z-10 bottom-10 right-6 w-72"
        maxHeight={400}
        onChangeOrder={() => null}
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
