import { useCallback, useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { XCircleIcon } from '@heroicons/react/solid';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import { useImpactLayer } from 'hooks/layers/impact';
import { useMaterialLayer } from 'hooks/layers/material';
import { useRiskLayer } from 'hooks/layers/risk';

import PopUp from 'components/map/popup';
import PageLoading from 'containers/page-loading';
import Legend from '../analysis-legend';

import { NUMBER_FORMAT } from '../constants';
import ZoomControl from 'components/map/controls/zoom';
import { analysisMap } from 'store/features/analysis';

import type { PopUpProps } from 'components/map/popup/types';
import { ViewState } from 'react-map-gl/src/mapbox/mapbox';

const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];
const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
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

interface HoverInfo {
  object: any;
  x: number;
  y: number;
  viewport: ViewState;
  layer: { id: string };
}

const useHoveredLayers: () => [HoverInfo[], (info: HoverInfo) => void] = () => {
  const [layersHoverInfo, setLayersHoverInfo] = useState<
    Record<string, HoverInfo & { timestamp: number }>
  >({});
  const timeout = 200;

  const onLayerHovered = useCallback((info: HoverInfo) => {
    if (!info?.layer) return;
    const timestamp = Date.now();
    setLayersHoverInfo((prevLayers) => ({
      ...prevLayers,
      [info.layer.id]: { ...info, timestamp },
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setLayersHoverInfo((prevLayers) => {
        if (
          Object.values(prevLayers).filter(({ timestamp }) => now - timestamp < timeout).length ===
          0
        ) {
          return prevLayers;
        }

        return Object.fromEntries(
          Object.entries(prevLayers).filter(([, { timestamp }]) => now - timestamp < timeout),
        );
      });
    }, timeout);

    return () => {
      clearInterval(interval);
    };
  }, [layersHoverInfo]);

  return [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.values(layersHoverInfo).map(({ timestamp, ...layerHoverInfo }) => layerHoverInfo),
    onLayerHovered,
  ];
};

const AnalysisMap: React.FC = () => {
  const filters = useAppSelector(analysisFilters);
  const { layers: layerOptions } = useAppSelector(analysisMap);
  const { layer } = filters;
  const [hoveredHexagon, setHoveredHexagon] = useState(null);
  const [popUpInfo, setPopUpInfo] = useState<PopUpInfoProps>(null);
  const [isRendering, setIsRendering] = useState(false);

  const [hoverInfo, onHoverLayer] = useHoveredLayers();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  // Loading layers
  const impactLayer = useImpactLayer();
  const materialLayer = useMaterialLayer();
  const riskLayer = useRiskLayer();
  const layers = useMemo(
    () => [impactLayer.layer, materialLayer.layer, riskLayer.layer],
    [impactLayer.layer, materialLayer.layer, riskLayer.layer],
  );
  const isError = materialLayer.isError || impactLayer.isError || riskLayer.isError;
  const isFetching = materialLayer.isFetching || impactLayer.isFetching || riskLayer.isFetching;

  const handleAfterRender = useCallback(() => setIsRendering(false), []);

  // const handleHover = useCallback(({ object, x, y, viewport }) => {
  //   setPopUpInfo({
  //     object: object ? { v: object.v } : null,
  //     x,
  //     y,
  //     viewport: viewport ? { width: viewport.width, height: viewport.height } : null,
  //   });
  //   setHoveredHexagon(object ? object.h : null);
  // }, []);

  // const unit = useMemo(() => {
  //   const unitMap = {
  //     material: h3MaterialData.metadata.unit,
  //     risk: h3RiskData.metadata.unit,
  //     impact: h3ImpactData.metadata.unit,
  //   };
  //   return unitMap[layer];
  // }, [h3MaterialData, h3RiskData, h3ImpactData, layer]);

  // const tooltipName = useMemo(() => {
  //   if (layer === 'material' && filters.materials?.length > 0) {
  //     return `${filters.materials[0].label}`;
  //   }
  //   if (layer === 'risk' && filters.indicator && filters.materials?.length > 0) {
  //     return `${filters.indicator.label}, for ${filters.materials[0].label}`;
  //   }
  //   if (layer === 'impact' && filters.indicator) {
  //     return filters.indicator.label;
  //   }
  //   return null;
  // }, [layer, filters]);

  const onZoomChange = useCallback(
    (zoom) => {
      setViewState((state) => ({ ...state, zoom, transitionDuration: 250 }));
    },
    [setViewState],
  );

  return (
    <>
      {(isFetching || isRendering) && <PageLoading />}
      <DeckGL
        initialViewState={viewState}
        onViewStateChange={({ viewState }) => {
          setViewState(viewState);
        }}
        controller
        layers={layers}
        onAfterRender={handleAfterRender}
        onHover={(info) => {
          // console.log(info);
          onHoverLayer(info);
        }}
      >
        <StaticMap
          viewState={viewState}
          mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
          mapboxApiAccessToken={MAPBOX_API_TOKEN}
          className="-z-10"
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
        <div className="absolute z-10 top-20 left-12 rounded-md bg-red-50 p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <p className="text-red-600 text-sm ml-3 mb-0">
              No available data for the current filter selection. Please try another one.
            </p>
          </div>
        </div>
      )}
      <div className="absolute z-10 bottom-10 right-6 space-y-2">
        <ZoomControl viewport={viewState} onZoomChange={onZoomChange} />
        <Legend />
      </div>
    </>
  );
};

export default AnalysisMap;
