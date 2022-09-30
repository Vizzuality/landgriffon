import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ImpactRanking } from 'types';
import type { ImpactTabularAPIParams } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<ImpactRanking> = {
  placeholderData: {
    impactTable: [],
    purchasedTonnes: [],
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ImpactRankingParams = ImpactTabularAPIParams & {
  maxRankingEntities: number;
  sort: string;
};

export function useImpactRanking(
  params: Partial<ImpactRankingParams> = { maxRankingEntities: 5, sort: 'ASC' },
  options: UseQueryOptions<ImpactRanking> = {},
): UseQueryResult<ImpactRanking, unknown> {
  const query = useQuery<ImpactRanking>(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get('/impact/ranking', {
          params,
        })
        .then((response) => {
          return response.data;
        }),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
}
