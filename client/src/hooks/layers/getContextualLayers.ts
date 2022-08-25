import { useQuery } from '@tanstack/react-query';
import { apiRawService } from 'services/api';
import { setLayer } from 'store/features/analysis/map';
import { useAppDispatch } from 'store/hooks';
import type { LayerMetadata } from 'types';

interface ContextualLayerApiResponse {
  category: string;
  id: string;
  name: string;
  metadata: LayerMetadata;
}

export interface CategoryWithLayers {
  category: string;
  layers: ContextualLayerApiResponse[];
}

type LayerCategoriesApiResponse = {
  data: CategoryWithLayers[];
};

const useContextualLayers = () => {
  const dispatch = useAppDispatch();
  return useQuery(
    ['contextual-layers'],
    () =>
      apiRawService
        .get<LayerCategoriesApiResponse>('/contextual-layers/categories')
        .then(({ data }) => data.data),
    {
      onSuccess: (data) => {
        const allLayers = data.flatMap((data) => data.layers);

        allLayers.forEach((layer, i) => {
          dispatch(
            setLayer({
              id: layer.id,
              layer: { ...layer, isContextual: true, order: i + 1 },
            }),
          );
        });
      },
    },
  );
};

export default useContextualLayers;
