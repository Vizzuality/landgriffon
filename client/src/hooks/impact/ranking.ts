import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { ImpactRanking } from 'types';
import type { ImpactTabularAPIParams } from 'types';

const DEFAULT_QUERY_OPTIONS = {
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

export const useImpactRanking = <T = ImpactRanking>(
  params: Partial<ImpactRankingParams> = { maxRankingEntities: 5, sort: 'ASC' },
  options: UseQueryOptions<ImpactRanking, unknown, T, ['impact-ranking', typeof params]> = {},
) => {
  const query = useQuery(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get<ImpactRanking>('/impact/ranking', {
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
};
