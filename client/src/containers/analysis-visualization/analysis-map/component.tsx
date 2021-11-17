import type { PopUpProps } from 'components/map/popup/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { StaticMap } from 'react-map-gl';
import { XCircleIcon } from '@heroicons/react/solid';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import PopUp from 'components/map/popup';
import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import Loading from 'components/loading';

import { useH3MaterialData, useH3RiskData, useH3ImpactData } from 'hooks/h3-data';

import { COLOR_RAMPS, NUMBER_FORMAT } from '../constants';

const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];
const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

type PopUpInfoProps = {
  object?: {
    v: number;
  } | null;
  x: number;
  y: number;
  viewport?: {
    width: number;
    height: number;
  };
};

const AnalysisMap: React.FC = () => {
  const { layer, filters } = useAppSelector(analysis);
  const [hoveredHexagon, setHoveredHexagon] = useState(null);
  const [popUpInfo, setPopUpInfo] = useState<PopUpInfoProps>(null);
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
  const {
    data: h3ImpactData,
    isFetching: isH3ImpactFetching,
    isError: isH3ImpactError,
  } = useH3ImpactData();
  const isError = isH3MaterialError || isH3RiskError || isH3ImpactError;
  const isFetching = isH3MaterialFetching || isH3RiskFetching || isH3ImpactFetching;

  const handleAfterRender = useCallback(() => setIsRendering(false), []);
  const handleHover = useCallback(({ object, x, y, viewport }) => {
    setPopUpInfo({
      object: object ? { v: object.v } : null,
      x,
      y,
      viewport: viewport ? { width: viewport.width, height: viewport.height } : null,
    });
    setHoveredHexagon(object ? object.h : null);
  }, []);

  const unit = useMemo(() => {
    const unitMap = {
      material: h3MaterialData.metadata.unit,
      risk: h3RiskData.metadata.unit,
      impact: h3ImpactData.metadata.unit,
    };
    return unitMap[layer];
  }, [h3MaterialData, h3RiskData, h3ImpactData, layer]);

  const legendName = useMemo(() => {
    if (layer === 'material' && filters.materials?.length > 0) {
      return `${filters.materials[0].label} in ${filters.startYear}`;
    }
    if (layer === 'risk' && filters.indicator && filters.materials?.length > 0) {
      return `${filters.indicator.label}, for ${filters.materials[0].label} in ${filters.startYear}`;
    }
    if (layer === 'impact' && filters.indicator) {
      return `${filters.indicator.label}, ${filters.startYear}`;
    }
    return null;
  }, [layer, filters]);

  const tooltipName = useMemo(() => {
    if (layer === 'material' && filters.materials?.length > 0) {
      return `${filters.materials[0].label}`;
    }
    if (layer === 'risk' && filters.indicator && filters.materials?.length > 0) {
      return `${filters.indicator.label}, for ${filters.materials[0].label}`;
    }
    if (layer === 'impact' && filters.indicator) {
      return filters.indicator.label;
    }
    return null;
  }, [layer, filters]);

  useEffect(() => {
    if (h3MaterialData?.data.length || h3RiskData?.data.length) {
      const nextLegendItems = [];

      if (layer === 'material') {
        nextLegendItems.push({
          id: 'h3-legend-material',
          name: legendName,
          unit,
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
          unit,
          min: NUMBER_FORMAT(h3RiskData.metadata.quantiles[0]),
          items: h3RiskData.metadata.quantiles.slice(1).map((v, index) => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[layer][index],
          })),
        });
      }

      if (layer === 'impact') {
        nextLegendItems.push({
          id: 'h3-legend-impact',
          name: legendName,
          unit,
          min: NUMBER_FORMAT(h3ImpactData.metadata.quantiles[0]),
          items: h3ImpactData.metadata.quantiles.slice(1).map((v, index) => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[layer][index],
          })),
        });
      }

      setLegendItems(nextLegendItems);
    }
  }, [h3MaterialData, h3RiskData, h3ImpactData, layer, filters, legendName, unit]);

  const layers = [
    new H3HexagonLayer({
      id: 'h3-layer-material',
      data: h3MaterialData.data,
      pickable: true,
      wireframe: false,
      filled: true,
      stroked: true,
      extruded: false,
      highPrecision: 'auto',
      visible: layer === 'material',
      opacity: 0.8,
      coverage: 0.9,
      lineWidthMinPixels: 2,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getElevation: (d) => d.v,
      getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
      onHover: handleHover,
      updateTriggers: {
        getLineColor: hoveredHexagon,
      },
    }),
    new H3HexagonLayer({
      id: 'h3-layer-risk',
      data: h3RiskData.data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: false,
      highPrecision: false,
      visible: layer === 'risk',
      opacity: 0.8,
      coverage: 0.9,
      lineWidthMinPixels: 2,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getElevation: (d) => d.v,
      getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
      onHover: handleHover,
      updateTriggers: {
        getLineColor: hoveredHexagon,
      },
    }),
    new H3HexagonLayer({
      id: 'h3-impact-risk',
      data: h3ImpactData.data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: false,
      elevationScale: 1,
      highPrecision: false,
      visible: layer === 'impact',
      opacity: 0.8,
      coverage: 0.9,
      lineWidthMinPixels: 2,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getElevation: (d) => d.v,
      getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
      onHover: handleHover,
      updateTriggers: {
        getLineColor: hoveredHexagon,
      },
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
      >
        <StaticMap
          mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
          mapboxApiAccessToken={MAPBOX_API_TOKEN}
        />
        {popUpInfo?.object && (
          <PopUp
            position={
              {
                ...popUpInfo.viewport,
                x: popUpInfo.x,
                y: popUpInfo.y,
              } as PopUpProps['position']
            }
          >
            <div className="p-4 bg-white shadow-sm rounded-sm">
              <h2 className="text-sm font-semibold whitespace-nowrap">{tooltipName}</h2>
              <div className="whitespace-nowrap">
                {NUMBER_FORMAT(popUpInfo.object.v)} ({unit})
              </div>
            </div>
          </PopUp>
        )}
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
