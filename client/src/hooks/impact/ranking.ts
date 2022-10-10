import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { ImpactTabularAPIParams } from 'types';
import type { ImpactDataApiResponse } from './types';

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

type ResponseType = ImpactDataApiResponse<false>;

export const useImpactRanking = <T = ResponseType>(
  params: Partial<ImpactRankingParams> = { maxRankingEntities: 5, sort: 'ASC' },
  options: UseQueryOptions<ResponseType, unknown, T, ['impact-ranking', typeof params]> = {},
) => {
  const query = useQuery(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get<ResponseType>('/impact/ranking', {
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
