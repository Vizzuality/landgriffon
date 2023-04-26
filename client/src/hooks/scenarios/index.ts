import { useMemo } from 'react';
import { useQuery, useQueryClient, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { apiService } from 'services/api';
import { scenarioClientContract } from 'client-contracts';

// types
import type {
  UseQueryResult,
  UseInfiniteQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { Scenario, ScenarioDTO } from 'containers/scenarios/types';
import type { APIMetadataPagination } from 'types';

type ResponseData = {
  data: Scenario[];
  meta: APIMetadataPagination;
};
type ResponseInfiniteData = UseInfiniteQueryResult<
  AxiosResponse<{
    data: Scenario[];
    meta: Record<string, unknown>;
  }>
>;

type ResponseDataScenario = UseQueryResult<Scenario>;

type QueryParams = {
  sort?: string;
  include?: string;
  'page[size]'?: number;
  'search[title]'?: string;
  disablePagination?: boolean;
  hasActiveInterventions?: boolean;
};

const DEFAULT_QUERY_OPTIONS = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

const DEFAULT_INFINITE_QUERY_OPTIONS = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export const useScenarios = <T = ResponseData>({
  params = {},
  options = {},
}: {
  params: QueryParams;
  options?: UseQueryOptions<ResponseData, unknown, T>;
}) => {
  const query = useQuery(
    ['scenariosList', params],
    () =>
      apiService
        .request<ResponseData>({
          method: 'GET',
          url: '/scenarios',
          params,
        })
        .then(({ data }) => data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: { data: [], meta: {} },
      ...options,
    },
  );

  return query;
};

export function useInfiniteScenarios(queryParams: QueryParams): ResponseInfiniteData {
  const fetchScenarios = ({ pageParam = 1 }) =>
    apiService.request({
      method: 'GET',
      url: '/scenarios',
      params: {
        ...queryParams,
        'page[number]': pageParam,
      },
    });

  const query = useInfiniteQuery(['scenariosList', queryParams], fetchScenarios, {
    ...DEFAULT_INFINITE_QUERY_OPTIONS,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage?.data;
      const { page, totalPages } = meta;
      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  return useMemo<ResponseInfiniteData>((): ResponseInfiniteData => query, [query]);
}

export function useScenario(
  id?: Scenario['id'] | null,
  queryParams?: QueryParams,
): ResponseDataScenario {
  const response: ResponseDataScenario = useQuery(
    ['scenario', id],
    () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${id}`,
          params: queryParams,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, enabled: !!id },
  );

  return useMemo<ResponseDataScenario>(() => response, [response]);
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation(
    (id: Scenario['id']) =>
      apiService.request({
        method: 'DELETE',
        url: `/scenarios/${decodeURIComponent(id)}`,
      }),
    {
      mutationKey: ['deleteScenario'],
      onSettled: () => {
        queryClient.invalidateQueries(['scenariosList']);
      },
    },
  );
}

export function useUpdateScenario() {
  const updateScenario = ({ id, data }: { id: Scenario['id']; data: Partial<ScenarioDTO> }) =>
    apiService.request<Scenario>({
      method: 'PATCH',
      data,
      url: `/scenarios/${decodeURIComponent(id)}`,
    });

  return useMutation(updateScenario, {
    mutationKey: ['editScenario'],
  });
}

export function useCreateScenario() {
  return scenarioClientContract.createScenario.useMutation({
    mutationKey: ['createScenario'],
  });
}
