import { useEffect, useCallback, useMemo } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import { PreviewStatus } from '@/containers/analysis-visualization/analysis-contextual-layer/categories/category-layer/types';
import DeckLayer from '@/components/map/layers/deck';
import Map from '@/components/map';
import ZoomControl from '@/components/map/controls/zoom';
import LayerManager from '@/components/map/layer-manager';
import { useH3Data } from '@/hooks/h3-data';
import PageLoading from '@/containers/page-loading';
import { useYears } from '@/hooks/years';
import useContextualLayers from '@/hooks/layers/getContextualLayers';
import ContextualLayer from '@/containers/analysis-visualization/analysis-map/layers/contextual';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { Dispatch } from 'react';
import type { Material, Layer } from '@/types';
import type { MapboxLayerProps } from '@/components/map/layers/types';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
  onStatusChange?: Dispatch<PreviewStatus>;
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

  const selectedLayer = useMemo(() => {
    return contextualLayers
      ?.flatMap((category) => category.layers)
      .find((layer) => layer.id === selectedLayerId);
  }, [contextualLayers, selectedLayerId]);

  const {
    data: h3data,
    isFetching,
    status,
    fetchStatus,
  } = useH3Data({
    id: selectedLayerId,
    params: {
      materialId: selectedMaterialId,
      year: materialYear,
    },
    options: {
      enabled:
        !!selectedLayerId &&
        (selectedLayerId !== 'material' || !!materialYear) &&
        !selectedLayer?.tilerUrl?.length,
      select: (response) => response.data,
      placeholderData: undefined,
    },
  });

  useEffect(() => {
    if (selectedLayer?.tilerUrl?.length) {
      return onStatusChange?.('success');
    }
    onStatusChange?.(status);
  }, [onStatusChange, status, fetchStatus, selectedLayer]);

  const PreviewLayer = useCallback(() => {
    if (!selectedLayerId) return null;

    if (selectedLayer?.tilerUrl?.length) {
      return <ContextualLayer id={selectedLayerId} />;
    }
    if (h3data?.length) {
      return (
        <DeckLayer<MapboxLayerProps<H3HexagonLayerProps>>
          id={PREVIEW_LAYER_ID}
          type={H3HexagonLayer}
          data={h3data}
          getHexagon={(d) => d.h}
          getFillColor={(d) => d.c}
          getLineColor={(d) => d.c}
        />
      );
    }
  }, [selectedLayerId, h3data, selectedLayer]);

  const layers = useMemo(() => [{ id: PREVIEW_LAYER_ID, layer: PreviewLayer }], [PreviewLayer]);

  return (
    <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
      {isFetching && <PageLoading />}
      <Map id="contextual-preview-map" mapStyle="terrain" viewState={INITIAL_PREVIEW_SETTINGS}>
        {() => <LayerManager layers={layers} />}
      </Map>
      <div className="absolute bottom-10 right-2 z-10 w-10 space-y-2">
        <ZoomControl mapId="contextual-preview-map" />
      </div>
    </div>
  );
};

export default PreviewMap;
