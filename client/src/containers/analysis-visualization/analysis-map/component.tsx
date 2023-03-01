import { useCallback, useMemo, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/solid';
import { MapboxLayer } from '@deck.gl/mapbox/typed';
import { sortBy } from 'lodash-es';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

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

import type {
  H3HexagonLayer as H3HexagonLayerType,
  H3HexagonLayerProps,
} from '@deck.gl/geo-layers/typed';
import type { ViewState } from 'react-map-gl';
import type { MapStyle } from 'components/map/types';
import type { BasemapValue } from 'components/map/controls/basemap/types';
import type { H3Data } from 'types';

const AnalysisMap = () => {
  const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);

  const [mapStyle, setMapStyle] = useState<MapStyle>('terrain');
  const [viewState, setViewState] = useState<Partial<ViewState>>(INITIAL_VIEW_STATE);
  const handleViewState = useCallback((viewState: ViewState) => setViewState(viewState), []);
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
  const contextualDataById = useMemo(() => {
    return Object.fromEntries(
      contextualData
        .filter((d) => d.isSuccess)
        .map(({ data: { layerId, ...rest } }) => [layerId, rest]),
    );
  }, [contextualData]);

  const onHoverLayer = useCallback(
    ({
      layer,
      object,
      coordinate,
      viewport,
      x,
      y,
    }: Parameters<H3HexagonLayerProps['onHover']>[0]): void => {
      const { id } = layer;
      const layerInfo = layersMetadata[id];

      setTooltipData({
        x,
        y,
        viewport,
        data: {
          ...object,
          coordinate,
          name: layerInfo.metadata?.name || layerInfo.metadata?.legend.name,
          unit: layerInfo.metadata?.legend?.unit,
        },
      });
    },
    [layersMetadata, setTooltipData],
  );

  const layers = useMemo(() => {
    return Object.values(layerDeckGLProps)
      .sort((a, b) => {
        if (layersMetadata[a.id].order > layersMetadata[b.id].order) return 1;
        if (layersMetadata[a.id].order < layersMetadata[b.id].order) return -1;
        return 0;
      })
      .map((props) => {
        const layerInfo = layersMetadata[props.id];
        if (!layerInfo) {
          return null;
        }

        let data: H3Data;

        switch (layerInfo.id) {
          case 'material':
            data = materialData?.data;
            break;
          case 'impact':
            data = impactData;
            break;
          default:
            data = contextualDataById[layerInfo.id]?.data || null;
        }

        if (!data) return null;

        return new MapboxLayer<
          H3HexagonLayerType<(typeof data)[0], { type: typeof H3HexagonLayer }>
        >({
          ...props,
          id: props.id,
          type: H3HexagonLayer,
          data,
          getHexagon: (d) => d.h,
          getFillColor: (d) => d.c,
          getLineColor: (d) => d.c,
          onHover: onHoverLayer,
        });
      })
      .filter((l) => !!l);
  }, [
    contextualDataById,
    impactData,
    layersMetadata,
    layerDeckGLProps,
    materialData?.data,
    onHoverLayer,
  ]);

  const handleMapStyleChange = useCallback((newStyle: BasemapValue) => {
    setMapStyle(newStyle);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden" data-testid="analysis-map">
      {isFetching && <PageLoading />}
      <Map mapStyle={mapStyle} viewState={viewState} onMapViewStateChange={handleViewState}>
        {(map) => (
          <>
            <LayerManager map={map} plugin={PluginMapboxGl}>
              {layers.map((_layer) => (
                <Layer key={_layer.id} id={_layer.id} type="deck" deck={[_layer]} />
              ))}
            </LayerManager>
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
