import { useCallback, useMemo, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/solid';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { setTooltipData, setTooltipPosition, setViewState } from 'store/features/analysis/map';
import { useDebounce } from 'rooks';

import { useImpactLayer } from 'hooks/layers/impact';

import Legend from 'containers/analysis-visualization/analysis-legend';
import PageLoading from 'containers/page-loading';
import ZoomControl from 'components/map/controls/zoom';
import PopUp from 'components/map/popup';
import BasemapControl from 'components/map/controls/basemap';

import { NUMBER_FORMAT } from 'utils/number-format';

import type { BasemapValue } from 'components/map/controls/basemap/types';
import { sortBy } from 'lodash';
import type { MapStyle, ViewState } from 'components/map';
import Map from 'components/map/component';
import { useAllContextualLayersData } from 'hooks/h3-data/contextual';
import useH3MaterialData from 'hooks/h3-data/material';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
};

const AnalysisMap: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    viewState,
    tooltipData,
    tooltipPosition,
    layerDeckGLProps,
    layers: layersMetadata,
  } = useAppSelector(analysisMap);

  const [localViewState, setLocalViewState] = useState<ViewState>({
    ...INITIAL_VIEW_STATE,
    ...viewState, // store has priority over local state
  });
  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');

  // Debounced view state update to avoid too many updates in the store
  const updateViewState = useCallback(
    (viewState) => {
      dispatch(
        // viewState have more attributes we want to save in the store
        setViewState({
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
        }),
      );
    },
    [dispatch],
  );
  const setDebouncedViewState = useDebounce(updateViewState, 300);

  // Loading layers
  const {
    isError,
    isFetching,
    data: { data: impactData },
  } = useImpactLayer();

  const { data: materialData } = useH3MaterialData(undefined, {
    keepPreviousData: false,
  });

  const contextualData = useAllContextualLayersData();

  const layers = useMemo(() => {
    const legends = Object.values(layerDeckGLProps)
      .map((props) => {
        const layerInfo = layersMetadata[props.id];
        if (!layerInfo) {
          return null;
        }

        const data = layerInfo.isContextual
          ? contextualData.get(props.id)?.data
          : layerInfo.id === 'material'
          ? materialData?.data
          : impactData;

        return new H3HexagonLayer({
          ...props,
          data,
          getHexagon: (d) => d.h,
          getFillColor: (d) => d.c,
          getLineColor: (d) => d.c,
          onHover: ({ object, x, y, viewport }) => {
            dispatch(
              setTooltipPosition({
                x,
                y,
                viewport: viewport ? { width: viewport.width, height: viewport.height } : null,
              }),
            );
            dispatch(
              setTooltipData({
                id: props.id,
                name: layerInfo.metadata?.name || layerInfo.metadata?.legend.name,
                value: object?.v,
                unit: layerInfo.metadata?.legend.unit,
              }),
            );
          },
        });
      })
      .filter((l) => !!l);
    return sortBy(legends, (l) => layersMetadata[l.id].order).reverse();
  }, [contextualData, dispatch, impactData, layerDeckGLProps, layersMetadata, materialData?.data]);

  const onZoomChange = useCallback(
    (zoom) => {
      setLocalViewState((state) => ({ ...state, zoom, transitionDuration: 250 }));
      dispatch(setViewState({ zoom }));
    },
    [dispatch],
  );

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

  return (
    <>
      {isFetching && <PageLoading />}
      <Map
        layers={layers}
        mapStyle={mapStyle}
        initialViewState={localViewState}
        onViewStateChange={({ viewState }) => {
          setDebouncedViewState({
            longitude: viewState.longitude,
            latitude: viewState.latitude,
            zoom: viewState.zoom,
          });
        }}
      >
        {!!tooltipData.length && (
          <PopUp
            position={{
              ...tooltipPosition.viewport,
              x: tooltipPosition.x,
              y: tooltipPosition.y,
            }}
          >
            <div className="px-4 py-2 space-y-2 bg-white rounded-md shadow-sm">
              {tooltipData.map((data) => (
                <div key={`tooltip-item-${data.id}`} className="whitespace-nowrap">
                  <strong className="text-xs font-semibold">{data.name}</strong>:{' '}
                  <span className="text-xs">
                    {data.value ? NUMBER_FORMAT(data.value) : '-'}
                    {data.unit && ` ${data.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </PopUp>
        )}
      </Map>
      {isError && (
        <div className="absolute z-10 p-4 rounded-md top-20 left-12 bg-red-50">
          <div className="flex">
            <XCircleIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
            <p className="mb-0 ml-3 text-sm text-red-600">
              No available data for the current filter selection. Please try another one.
            </p>
          </div>
        </div>
      )}
      <div className="absolute z-10 w-10 space-y-2 bottom-10 right-6">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl viewport={viewState} onZoomChange={onZoomChange} />
        <Legend />
      </div>
    </>
  );
};

export default AnalysisMap;
