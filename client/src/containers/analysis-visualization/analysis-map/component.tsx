import { useCallback, useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { StaticMap } from 'react-map-gl';
import { XCircleIcon } from '@heroicons/react/solid';

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
  const { layer, filters } = useAppSelector(analysis);

  // const [layers, setLayers] = useState([]);
  const [legendItems, setLegendItems] = useState([]);
  const [isRendering, setIsRendering] = useState(false);

  const {
    data: h3MaterialData,
    isFetching: isH3MaterialFetching,
    isError: isH3MaterialError,
  } = useH3MaterialData();
  const {
    data: h3RiskData,
    isFetching: isH3RiskFetching,
    isError: isH3RiskError,
  } = useH3RiskData();
  const isError = isH3MaterialError || isH3RiskError;
  const isFetching = isH3MaterialFetching || isH3RiskFetching;

  const handleAfterRender = useCallback(() => setIsRendering(false), []);

  const legendName = useMemo(() => {
    if (layer === 'material' && filters.materials?.length > 0) {
      return `${filters.materials[0].label} in ${filters.startYear}`;
    }
    if (layer === 'risk' && filters.indicator && filters.materials?.length > 0) {
      return `${filters.indicator.label}, for ${filters.materials[0].label} in ${filters.startYear}`;
    }
    return null;
  }, [layer, filters]);

  useEffect(() => {
    // setIsRendering(true);

    if (h3MaterialData?.data.length || h3RiskData?.data.length) {
      const nextLegendItems = [];

      if (layer === 'material') {
        nextLegendItems.push({
          id: 'h3-legend-material',
          name: legendName,
          unit: h3MaterialData.metadata.unit,
          min: NUMBER_FORMAT(h3MaterialData.metadata.quantiles[0]),
          items: h3MaterialData.metadata.quantiles.slice(1).map((v, index) => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[layer][index],
          })),
        });
      }

      if (layer === 'risk') {
        nextLegendItems.push({
          id: 'h3-legend-risk',
          name: legendName,
          unit: h3RiskData.metadata.unit,
          min: NUMBER_FORMAT(h3RiskData.metadata.quantiles[0]),
          items: h3RiskData.metadata.quantiles.slice(1).map((v, index) => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[layer][index],
          })),
        });
      }

      setLegendItems(nextLegendItems);
    }
  }, [h3MaterialData, h3RiskData, layer, filters]);

  const layers = [
    new H3HexagonLayer({
      id: 'h3-layer-material',
      data: h3MaterialData.data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 1,
      highPrecision: false,
      visible: layer === 'material',
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
      visible: layer === 'risk',
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getElevation: (d) => d.v,
    }),
  ];

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
      {isError && (
        <div className="absolute z-10 top-20 left-12 p-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <p className="text-red-600 text-sm ml-3 mb-0">
              No available data for the current filter selection. Please try another one.
            </p>
          </div>
        </div>
      )}
      {legendItems?.length > 0 && (
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
      )}
    </>
  );
};

export default AnalysisMap;
