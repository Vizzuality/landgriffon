import { useEffect, useCallback, useMemo } from 'react';
import { MapProvider } from 'react-map-gl';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import DeckLayer from 'components/map/layers/deck';
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';
import { useH3Data } from 'hooks/h3-data';
import PageLoading from 'containers/page-loading';
import { useYears } from 'hooks/years';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Dispatch } from 'react';
import type { Material, Layer } from 'types';
import type { MapboxLayerProps } from 'components/map/layers/types';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
  onStatusChange?: Dispatch<UseQueryResult['status']>;
}

const INITIAL_PREVIEW_SETTINGS = {
  minZoom: 0,
  zoom: 1,
};

const PREVIEW_LAYER_ID = 'preview';

const PreviewMap = ({ selectedLayerId, selectedMaterialId, onStatusChange }: PreviewMapProps) => {
  const { data: materialYear } = useYears('material', [selectedMaterialId], 'all', {
    enabled: !!selectedMaterialId,
    select: (data) => {
      return data?.[data?.length - 1];
    },
  });

  const { data, isFetching, status } = useH3Data({
    id: selectedLayerId,
    params: {
      materialId: selectedMaterialId,
      year: materialYear,
    },
    options: {
      enabled: !!selectedLayerId && (selectedLayerId !== 'material' || !!materialYear),
      select: (response) => response.data,
      staleTime: 10000,
      // having placeholder data makes the status always be success
      placeholderData: undefined,
    },
  });

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  const PreviewLayer = useCallback(() => {
    if (!data?.length) return null;

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
  }, [data]);

  const layers = useMemo(() => ({ [PREVIEW_LAYER_ID]: PreviewLayer }), [PreviewLayer]);

  return (
    <MapProvider>
      {isFetching && <PageLoading />}
      <Map id="contextual-preview-map" mapStyle="terrain" viewState={INITIAL_PREVIEW_SETTINGS}>
        {() => <LayerManager layers={layers} />}
      </Map>
    </MapProvider>
  );
};

export default PreviewMap;
