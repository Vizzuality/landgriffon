import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
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

interface ApiResponse {
  data: { category: string; layers: ContextualLayerApiResponse[] }[];
}

const useContextualLayers = () => {
  const dispatch = useAppDispatch();
  const query = useQuery<UseQueryResult<ApiResponse>, unknown, ContextualLayerApiResponse[]>(
    ['contextual-layers'],
    () => apiRawService.get('/contextual-layers/categories'),
    {
      select: ({ data }) =>
        data.data.flatMap((d) => d.layers).map((layer, i) => ({ ...layer, order: i + 1 })),
      onSuccess: (data) => {
        data.forEach((layer) => {
          dispatch(
            setLayer({
              id: layer.id,
              layer: { ...layer, isContextual: true },
            }),
          );
        });
      },
    },
  );

  return query;
};

export default useContextualLayers;
