import { useCallback, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { XCircleIcon } from '@heroicons/react/solid';

import { useAppSelector } from 'store/hooks';

import { useImpactLayer } from 'hooks/layers/impact';
import { useMaterialLayer } from 'hooks/layers/material';
import { useRiskLayer } from 'hooks/layers/risk';

import PopUp from 'components/map/popup';
import PageLoading from 'containers/page-loading';
import Legend from '../analysis-legend';

import { NUMBER_FORMAT } from 'utils/number-format';
import ZoomControl from 'components/map/controls/zoom';
import { analysisMap } from 'store/features/analysis';

import type { PopUpProps } from 'components/map/popup/types';
import BasemapControl from 'components/map/controls/basemap';

import DefaultMapStyle from './styles/map-style.json';
import SatelliteMapStyle from './styles/map-style-satellite.json';
import { BasemapValue } from 'components/map/controls/basemap/types';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
};

const MAP_SYTLES = {
  terrain: DefaultMapStyle,
  satellite: SatelliteMapStyle,
};

const AnalysisMap: React.FC = () => {
  const { tooltipData, tooltipPosition, layers: layerProps } = useAppSelector(analysisMap);
  const [isRendering, setIsRendering] = useState(false);

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const [mapStyle, setMapStyle] = useState<BasemapValue>('terrain');

  // Loading layers
  const impactLayer = useImpactLayer();
  const materialLayer = useMaterialLayer();
  const riskLayer = useRiskLayer();

  const layers = useMemo(() => {
    return [impactLayer, materialLayer, riskLayer]
      .sort((a, b) => layerProps[b.layer.id].order - layerProps[a.layer.id].order)
      .map((layer) => layer.layer);
  }, [impactLayer, layerProps, materialLayer, riskLayer]);

  const isError = materialLayer.isError || impactLayer.isError || riskLayer.isError;
  const isFetching = materialLayer.isFetching || impactLayer.isFetching || riskLayer.isFetching;

  const handleAfterRender = useCallback(() => setIsRendering(false), []);

  const onZoomChange = useCallback(
    (zoom) => {
      setViewState((state) => ({ ...state, zoom, transitionDuration: 250 }));
    },
    [setViewState],
  );

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

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
      >
        <StaticMap
          viewState={viewState}
          mapStyle={MAP_SYTLES[mapStyle]}
          mapboxApiAccessToken={MAPBOX_API_TOKEN}
          className="-z-10"
        />
        {!!tooltipData.length && (
          <PopUp
            position={
              {
                ...tooltipPosition.viewport,
                x: tooltipPosition.x,
                y: tooltipPosition.y,
              } as PopUpProps['position']
            }
          >
            <div className="py-2 px-4 space-y-2 bg-white shadow-sm rounded-md">
              {tooltipData.map((data) => (
                <div key={`tooltip-item-${data.id}`} className="whitespace-nowrap">
                  <strong className="text-xs font-semibold">{data.name}</strong>:{' '}
                  <span className="text-xs">
                    {data.value ? NUMBER_FORMAT(data.value) : '-'} ({data.unit})
                  </span>
                </div>
              ))}
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
      <div className="absolute z-10 bottom-10 right-6 space-y-2 w-10">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl viewport={viewState} onZoomChange={onZoomChange} />
        <Legend />
      </div>
    </>
  );
};

export default AnalysisMap;
