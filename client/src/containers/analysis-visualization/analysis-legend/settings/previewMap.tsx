import { useMemo } from 'react';
import Map from 'components/map';
import type { Layer, Material } from 'types';
import { useH3Data } from 'hooks/h3-data';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';
import PageLoading from 'containers/page-loading';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
}

const BASE_LAYER_PROPS = {
  getHexagon: (d) => d.h,
  getFillColor: (d) => d.c,
  getLineColor: (d) => d.c,
};

const PreviewMap = ({ selectedLayerId, selectedMaterialId }: PreviewMapProps) => {
  const { data, isFetching } = useH3Data({
    id: selectedLayerId,
    params: {
      materialId: selectedMaterialId,
    },
    options: { enabled: !!selectedLayerId, select: (response) => response.data },
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
      <Map initialViewState={{ minZoom: 0, zoom: 0 }} layers={[h3Layer]} mapStyle="terrain"></Map>
    </>
  );
};

export default PreviewMap;
