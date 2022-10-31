import { useEffect, useMemo } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import Map from 'components/map';
import { useH3Data } from 'hooks/h3-data';
import PageLoading from 'containers/page-loading';
import { useYears } from 'hooks/years';

import type { UseQueryResult } from '@tanstack/react-query';
import type { Dispatch } from 'react';
import type { Layer, Material } from 'types';

interface PreviewMapProps {
  selectedLayerId?: Layer['id'];
  selectedMaterialId?: Material['id'];
  onStatusChange?: Dispatch<UseQueryResult['status']>;
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
    return new H3HexagonLayer({
      ...BASE_LAYER_PROPS,
      data,
    });
  }, [data]);

  return (
    <>
      {isFetching && <PageLoading />}
      <Map initialViewState={INITIAL_PREVIEW_SETTINGS} layers={[h3Layer]} mapStyle="terrain" />
    </>
  );
};

export default PreviewMap;
