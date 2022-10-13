import { useMemo } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import Map from 'components/map';
import { useH3Data } from 'hooks/h3-data';
import PageLoading from 'containers/page-loading';

import type { Layer, Material } from 'types';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
}

const BASE_LAYER_PROPS = {
  id: 'layer-preview',
  getHexagon: (d) => d.h,
  getFillColor: (d) => d.c,
  getLineColor: (d) => d.c,
};

const INITIAL_PREVIEW_SETTINGS = {
  minZoom: 0,
  zoom: 0,
};

const PreviewMap = ({ selectedLayerId, selectedMaterialId }: PreviewMapProps) => {
  const { data, isFetching } = useH3Data({
    id: selectedLayerId,
    params: {
      materialId: selectedMaterialId,
    },
    options: {
      enabled: !!selectedLayerId,
      select: (response) => response.data,
      keepPreviousData: true,
      staleTime: 10000,
    },
  });

  const h3Layer = useMemo(() => {
    return new H3HexagonLayer({
      ...BASE_LAYER_PROPS,
      data,
    });
  }, [data]);

  return (
    <>
      {isFetching && <PageLoading />}
      <Map initialViewState={INITIAL_PREVIEW_SETTINGS} layers={[h3Layer]} mapStyle="terrain"></Map>
    </>
  );
};

export default PreviewMap;
