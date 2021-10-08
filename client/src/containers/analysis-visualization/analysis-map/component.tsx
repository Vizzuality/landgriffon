import { useCallback, useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { StaticMap } from 'react-map-gl';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import Loading from 'components/loading';

import { useH3MaterialData, useH3RiskData } from 'lib/hooks/h3-data';

import { COLOR_RAMPS, NUMBER_FORMAT } from '../constants';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

const AnalysisMap: React.FC = () => {
  const { dataset } = useAppSelector(analysis);

  const [layers, setLayers] = useState([]);
  const [legendItems, setLegendItems] = useState([]);
  const [isRendering, setIsRendering] = useState(false);

  const { data: h3MaterialData, isFetching } = useH3MaterialData();
  const { data: h3RiskData } = useH3RiskData();

  const handleAfterRender = useCallback(() => setIsRendering(false), []);

  useEffect(() => {
    setIsRendering(true);

    if (h3MaterialData || h3RiskData) {
      const { data, metadata } = h3MaterialData;
      const { name, unit, quantiles } = metadata;

      setLayers([
        new H3HexagonLayer({
          id: 'h3-layer-material',
          data,
          pickable: true,
          wireframe: false,
          filled: true,
          extruded: true,
          elevationScale: 1,
          highPrecision: false,
          visible: dataset === 'material',
          getHexagon: (d) => d.h,
          getFillColor: (d) => d.c,
          getElevation: (d) => d.v,
        }),
        new H3HexagonLayer({
          id: 'h3-layer-risk',
          data: h3RiskData.data,
          pickable: true,
          wireframe: false,
          filled: true,
          extruded: true,
          elevationScale: 1,
          highPrecision: false,
          visible: dataset === 'risk',
          getHexagon: (d) => d.h,
          getFillColor: (d) => d.c,
          getElevation: (d) => d.v,
        }),
      ]);

      setLegendItems([
        {
          id: 'h3-legend',
          name,
          unit,
          min: NUMBER_FORMAT(quantiles[0]),
          items: quantiles.slice(1).map((v, index) => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[dataset][index],
          })),
        },
      ]);
    }
  }, [h3MaterialData, h3RiskData, dataset]);

  return (
    <>
      {(isFetching || isRendering) && (
        <div className="absolute w-full h-full bg-black bg-opacity-40 backdrop-blur-sm z-20 flex justify-center items-center">
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
            <LegendTypeChoropleth className="text-sm text-gray-500" min={i.min} items={i.items} />
          </LegendItem>
        ))}
      </Legend>
    </>
  );
};

export default AnalysisMap;
