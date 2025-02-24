import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';
import { setLayer } from 'store/features/analysis/map';
import { useAppDispatch } from 'store/hooks';
import queryKeyStore from '@/lib/react-query/querykey-store';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { StringifiableRecord } from 'query-string';
import type { LayerMetadata } from 'types';

export interface ContextualLayerApiResponse {
  category: string;
  id: string;
  name: string;
  metadata: LayerMetadata;
  tilerUrl?: string;
  defaultTilerParams?: StringifiableRecord;
}

export interface CategoryWithLayers {
  category: string;
  layers: ContextualLayerApiResponse[];
}

type LayerCategoriesApiResponse = {
  data: CategoryWithLayers[];
};

const useContextualLayers = (
  options: Omit<UseQueryOptions<LayerCategoriesApiResponse['data']>, 'select'> = {},
) => {
  const dispatch = useAppDispatch();
  return useQuery(
    queryKeyStore.contextualLayers.categories.queryKey,
    () =>
      apiRawService
        .get<LayerCategoriesApiResponse>('/contextual-layers/categories')
        .then(({ data }) => data.data)
        .then((data) => data.filter((category) => category.layers.length > 0)),
    {
      keepPreviousData: true,
      ...options,
      onSuccess: (data) => {
        options?.onSuccess?.(data);

        const allLayers = data.flatMap((data) => data.layers);
        allLayers.forEach((layer, i) => {
          dispatch(
            setLayer({
              id: layer.id,
              // TODO: don't hardcode this
              layer: { ...layer, isContextual: true, order: i + 2 },
            }),
          );
        });
      },
    },
  );
};

export default useContextualLayers;
