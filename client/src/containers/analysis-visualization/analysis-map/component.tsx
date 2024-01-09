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

import type { LayerConstructor } from 'components/map/layers/utils';
import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { ViewState } from 'react-map-gl';
import type { MapStyle } from 'components/map/types';
import type { BasemapValue } from 'components/map/controls/basemap/types';
import type { Layer, Legend as LegendType } from 'types';

const getLegendScale = (legendInfo: LegendType) => {
  if (legendInfo?.type === 'range' || legendInfo?.type === 'category') {
    const threshold = legendInfo.items.map((item) => item.value);
    const rangeValues = legendInfo.items.map((item) => item.label);
    const scale = scaleByLegendType(legendInfo?.type, threshold as number[], rangeValues);
    return scale;
  }
  return (value: number) => {
    if (!value) return null;
    if (!Number.isNaN(value)) return NUMBER_FORMAT(Number(value));
    return value.toString();
  };
};

const AnalysisMap = () => {
  const { layers } = useAppSelector(analysisMap);
  const { isSidebarCollapsed } = useAppSelector(analysisUI);

  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [viewState, setViewState] = useState<Partial<ViewState>>(INITIAL_VIEW_STATE);
  const handleViewState = useCallback((viewState: ViewState) => setViewState(viewState), []);
  const [tooltipData, setTooltipData] = useState(null);

  // Pre-Calculating legend scales
  const legendScales = useMemo(() => {
    const scales = {};
    Object.values(layers).forEach((layer) => {
      scales[layer.id] = getLegendScale(layer.metadata?.legend);
    });
    return scales;
  }, [layers]);

  // Loading layers
  const { isError, isFetching } = useImpactLayer();

  const onHoverLayer = useCallback(
    (
      { object, coordinate, viewport, x, y }: Parameters<H3HexagonLayerProps['onHover']>[0],
      metadata: Layer['metadata'] & { layerId?: string },
    ): void => {
      setTooltipData({
        x,
        y,
        viewport,
        data: {
          ...object,
          v: legendScales[metadata?.layerId]
            ? legendScales[metadata?.layerId](object?.v)
            : object?.v,
          coordinate,
          name: metadata?.name || metadata?.legend.name,
          unit: metadata?.legend?.unit,
          legend: metadata?.legend,
        },
      });
    },
    [legendScales],
  );

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

  const sortedLayers: { id: string; layer: LayerConstructor; props: Layer }[] = useMemo(() => {
    return Object.values(layers)
      .filter((layer) => layer.active && !!layers[layer.id])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (a.order < b.order) return -1;
        return 0;
      })
      .map((layer) => ({ id: layer.id, layer: getLayerConfig(layers[layer.id]), props: layer }));
  }, [layers]);

  return (
    <div className="absolute left-0 top-0 h-full w-full overflow-hidden" data-testid="analysis-map">
      {isFetching && <PageLoading />}
      <Map
        className="h-full w-screen"
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
                <div className="space-y-2 rounded-md bg-white p-4 shadow-md">
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
        <div className="left-12 top-20 rounded-md bg-red-50 p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <p className="mb-0 ml-3 text-sm text-red-400">
              No available data for the current filter selection. Please try another one.
            </p>
          </div>
        </div>
      )}
      <div className="absolute bottom-10 right-6 z-10 w-10 space-y-2">
        <BasemapControl value={mapStyle} onChange={handleMapStyleChange} />
        <ZoomControl />
        <Legend />
      </div>
    </div>
  );
};

export default AnalysisMap;
