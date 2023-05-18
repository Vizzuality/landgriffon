import { useCallback, useMemo, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/solid';

import { scaleByLegendType } from 'hooks/h3-data/utils';
import LayerManager from 'components/map/layer-manager';
import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { analysisUI } from 'store/features/analysis/ui';
import { useImpactLayer } from 'hooks/layers/impact';
import Legend from 'containers/analysis-visualization/analysis-legend';
import PageLoading from 'containers/page-loading';
import ZoomControl from 'components/map/controls/zoom';
import PopUp from 'components/map/popup';
import BasemapControl from 'components/map/controls/basemap';
import { NUMBER_FORMAT } from 'utils/number-format';
import Map, { INITIAL_VIEW_STATE } from 'components/map';
import { getLayerConfig } from 'components/map/layers/utils';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { ViewState } from 'react-map-gl';
import type { MapStyle } from 'components/map/types';
import type { BasemapValue } from 'components/map/controls/basemap/types';
import type { Layer, Legend as LegendType } from 'types';

const getValueInRange = (value: number, legendInfo: LegendType): string => {
  const threshold = legendInfo.items.map((item) => item.value);
  const rangeValues = legendInfo.items.map((item) => item.label);
  const scale = scaleByLegendType(legendInfo?.type, threshold as number[], rangeValues);
  return scale(value);
};

const AnalysisMap = () => {
  const { layers } = useAppSelector(analysisMap);
  const { isSidebarCollapsed } = useAppSelector(analysisUI);

  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [viewState, setViewState] = useState<Partial<ViewState>>(INITIAL_VIEW_STATE);
  const handleViewState = useCallback((viewState: ViewState) => setViewState(viewState), []);
  const [tooltipData, setTooltipData] = useState(null);

  // Loading layers
  const { isError, isFetching } = useImpactLayer();

  const onHoverLayer = useCallback(
    (
      { object, coordinate, viewport, x, y }: Parameters<H3HexagonLayerProps['onHover']>[0],
      metadata: Layer['metadata'],
    ): void => {
      const v =
        metadata?.legend?.type === 'range'
          ? getValueInRange(object?.v, metadata?.legend)
          : NUMBER_FORMAT(Number(object?.v));

      setTooltipData({
        x,
        y,
        viewport,
        data: {
          ...object,
          v,
          coordinate,
          name: metadata?.name || metadata?.legend.name,
          unit: metadata?.legend?.unit,
          legend: metadata?.legend,
        },
      });
    },
    [setTooltipData],
  );

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

  const sortedLayers = useMemo(() => {
    const layerIds = Object.values(layers)
      .filter((layer) => layer.active)
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (a.order < b.order) return -1;
        return 0;
      })
      .map(({ id }) => id);

    // ! review this: not sure outputting an object ensures the order of the layers
    return layerIds.reduce(
      (current, next) => ({
        ...current,
        [next]: getLayerConfig(layers[next]),
      }),
      {},
    );
  }, [layers]);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden" data-testid="analysis-map">
      {isFetching && <PageLoading />}
      <Map
        className="w-screen h-full"
        mapStyle={mapStyle}
        viewState={viewState}
        onMapViewStateChange={handleViewState}
        // style={{ width}}
        sidebarCollapsed={isSidebarCollapsed}
      >
        {() => (
          <>
            <LayerManager layers={sortedLayers} onHoverLayer={onHoverLayer} />
            {tooltipData && tooltipData.data?.v && (
              <PopUp
                position={{
                  ...tooltipData.viewport,
                  x: tooltipData.x,
                  y: tooltipData.y,
                }}
              >
                <div className="p-4 space-y-2 bg-white rounded-md shadow-md">
                  <div className="text-sm font-semibold text-gray-900">
                    {tooltipData.data.v}
                    {tooltipData.data.unit && ` ${tooltipData.data.unit}`}
                  </div>
                  <div className="text-xs text-gray-500">{tooltipData.data.name}</div>
                </div>
              </PopUp>
            )}
          </>
        )}
      </Map>
      {isError && (
        <div className="p-4 rounded-md top-20 left-12 bg-red-50">
          <div className="flex">
            <XCircleIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
            <p className="mb-0 ml-3 text-sm text-red-400">
              No available data for the current filter selection. Please try another one.
            </p>
          </div>
        </div>
      )}
      <div className="absolute z-10 w-10 space-y-2 bottom-10 right-6">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl />
        <Legend />
      </div>
    </div>
  );
};

export default AnalysisMap;
