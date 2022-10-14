import { useCallback, useMemo, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/solid';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import sortBy from 'lodash/sortBy';
import { pick } from 'lodash';

import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { useImpactLayer } from 'hooks/layers/impact';
import Legend from 'containers/analysis-visualization/analysis-legend';
import PageLoading from 'containers/page-loading';
import ZoomControl from 'components/map/controls/zoom';
import PopUp from 'components/map/popup';
import BasemapControl from 'components/map/controls/basemap';
import { NUMBER_FORMAT } from 'utils/number-format';
import Map, { INITIAL_VIEW_STATE } from 'components/map';
import { useAllContextualLayersData } from 'hooks/h3-data/contextual';
import useH3MaterialData from 'hooks/h3-data/material';
import useQueryParam from 'hooks/queryParam';

import type { ViewState, MapStyle } from 'components/map';
import type { BasemapValue } from 'components/map/controls/basemap/types';

const AnalysisMap = () => {
  const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);

  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [tooltipData, setTooltipData] = useState(null);

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
          onHover: ({ coordinate, object, viewport, x, y }) => {
            setTooltipData({
              x,
              y,
              viewport,
              data: {
                ...object,
                coordinate,
                name: layerInfo.metadata?.name || layerInfo.metadata?.legend.name,
                unit: layerInfo.metadata?.unit,
              },
            });
          },
        });
      })
      .filter((l) => !!l);
    return sortBy(legends, (l) => layersMetadata[l.id].order).reverse();
  }, [contextualData, impactData, layerDeckGLProps, layersMetadata, materialData?.data]);

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

  const formatParam = useCallback((view: ViewState) => {
    return pick(view, ['latitude', 'longitude', 'zoom']);
  }, []);

  const [viewState, setViewState] = useQueryParam('viewState', INITIAL_VIEW_STATE, {
    formatParam,
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      {isFetching && <PageLoading />}
      <Map
        layers={layers}
        mapStyle={mapStyle}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
      >
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
                {NUMBER_FORMAT(Number(tooltipData.data.v))}
                {tooltipData.data.unit && ` ${tooltipData.data.unit}`}
              </div>
              <div className="text-xs text-gray-500">{tooltipData.data.name}</div>
            </div>
          </PopUp>
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
        <ZoomControl
          viewport={viewState}
          onZoomChange={(zoom) => {
            setViewState({ ...viewState, zoom, transitionDuration: 250 });
          }}
        />
        <Legend />
      </div>
    </div>
  );
};

export default AnalysisMap;
