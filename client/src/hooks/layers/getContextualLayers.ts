import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { apiRawService } from 'services/api';
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
  const query = useQuery<UseQueryResult<ApiResponse>, unknown, ContextualLayerApiResponse[]>(
    ['contextual-layers'],
    async () => apiRawService.get('/contextual-layers/categories'),
    {
      select: ({ data }) =>
        data.data.flatMap((d) => d.layers).map((layer, i) => ({ ...layer, order: i + 1 })),
    },
  );

  return query;
};

export default useContextualLayers;
