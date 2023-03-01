import { useEffect, useMemo } from 'react';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { MapboxLayer } from '@deck.gl/mapbox/typed';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import Map from 'components/map';
import { useH3Data } from 'hooks/h3-data';
import PageLoading from 'containers/page-loading';
import { useYears } from 'hooks/years';

import type { H3HexagonLayer as H3HexagonLayerType } from '@deck.gl/geo-layers/typed';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Dispatch } from 'react';
import type { Material } from 'types';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
  onStatusChange?: Dispatch<UseQueryResult['status']>;
}

const INITIAL_PREVIEW_SETTINGS = {
  minZoom: 0,
  zoom: 0,
};

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

  const h3Layer = useMemo(() => {
    if (!data?.length) return null;

    return new MapboxLayer<H3HexagonLayerType<(typeof data)[0], { type: typeof H3HexagonLayer }>>({
      id: 'layer-preview',
      type: H3HexagonLayer,
      data,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getLineColor: (d) => d.c,
    });
  }, [data]);

  return (
    <>
      {isFetching && <PageLoading />}
      <Map id="contextual-preview-map" mapStyle="terrain" viewState={INITIAL_PREVIEW_SETTINGS}>
        {(map) => (
          <LayerManager map={map} plugin={PluginMapboxGl}>
            {h3Layer && <Layer key={h3Layer.id} id={h3Layer.id} type="deck" deck={[h3Layer]} />}
          </LayerManager>
        )}
      </Map>
    </>
  );
};

export default PreviewMap;
