import { useEffect, useCallback, useMemo } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';
import { UseQueryResult } from '@tanstack/react-query';

import Map from '@/components/map';
import DeckLayer from '@/components/map/layers/deck';
import ZoomControl from '@/components/map/controls/zoom';
import LayerManager from '@/components/map/layer-manager';
import MapboxRasterLayer from '@/components/map/layers/maplibre/raster';
import { useH3Data } from 'hooks/h3-data';
import PageLoading from 'containers/page-loading';
import { useYears } from 'hooks/years';
import useContextualLayers from '@/hooks/layers/getContextualLayers';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { Dispatch } from 'react';
import type { Material, Layer } from 'types';
import type { MapboxLayerProps } from '@/components/map/layers/types';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
  onStatusChange?: Dispatch<UseQueryResult['status']>;
}

const INITIAL_PREVIEW_SETTINGS = {
  minZoom: 0,
  zoom: 1,
  attributionControl: false,
};

const PREVIEW_LAYER_ID = 'preview';

const PreviewMap = ({ selectedLayerId, selectedMaterialId, onStatusChange }: PreviewMapProps) => {
  const { data: materialYear } = useYears('material', [selectedMaterialId], 'all', {
    enabled: !!selectedMaterialId,
    select: (data) => {
      return data?.[data?.length - 1];
    },
  });

  const { data: contextualLayers } = useContextualLayers();

  // @debt given how useContextualLayers is implemented, we cannot parse the data during the query fetching
  const selectedLayer = contextualLayers
    ?.flatMap((category) => category.layers)
    .find((layer) => layer.id === selectedLayerId);

  const isRasterLayer = !!selectedLayer?.tilerUrl;

  const { data, isFetching, status } = useH3Data({
    id: selectedLayerId,
    params: {
      materialId: selectedMaterialId,
      year: materialYear,
    },
    options: {
      enabled:
        !!selectedLayerId && (selectedLayerId !== 'material' || !!materialYear) && !isRasterLayer,
      select: (response) => response.data,
      // having placeholder data makes the status always be success
      placeholderData: undefined,
    },
  });

  const getLayerFetchingStatus = useCallback(() => {
    if (isRasterLayer) return 'success';
    if (status === 'error') return status;
    if (isFetching) return 'loading';

    return status;
  }, [isRasterLayer, isFetching, status]);

  useEffect(() => {
    onStatusChange?.(getLayerFetchingStatus());
  }, [onStatusChange, getLayerFetchingStatus]);

  const PreviewLayer = useCallback(() => {
    if ((!data?.length && !selectedLayer?.tilerUrl) || !selectedLayerId) return null;

    if (isRasterLayer) {
      return (
        <MapboxRasterLayer
          id={selectedLayer.id}
          beforeId="custom-layers"
          tilerUrl={selectedLayer.tilerUrl}
          defaultTilerParams={selectedLayer.defaultTilerParams}
        />
      );
    }

    return (
      <DeckLayer<MapboxLayerProps<H3HexagonLayerProps>>
        id={PREVIEW_LAYER_ID}
        type={H3HexagonLayer}
        data={data}
        getHexagon={(d) => d.h}
        getFillColor={(d) => d.c}
        getLineColor={(d) => d.c}
      />
    );
  }, [data, isRasterLayer, selectedLayer, selectedLayerId]);

  const layers = useMemo(() => [{ id: PREVIEW_LAYER_ID, layer: PreviewLayer }], [PreviewLayer]);

  return (
    <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
      {isFetching && <PageLoading />}
      <Map id="contextual-preview-map" mapStyle="terrain" viewState={INITIAL_PREVIEW_SETTINGS}>
        {() => <LayerManager layers={layers} />}
      </Map>
      <div className="absolute bottom-2 right-2 z-10 w-10 space-y-2">
        <ZoomControl mapId="contextual-preview-map" />
      </div>
    </div>
  );
};

export default PreviewMap;
