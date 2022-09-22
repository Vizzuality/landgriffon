import { useMemo } from 'react';
import type {
  UseQueryResult,
  UseInfiniteQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useQuery, useQueryClient, useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { apiService } from 'services/api';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

// types
import type { AxiosResponse } from 'axios';
import type { Scenario } from 'containers/scenarios/types';
import type { Intervention } from 'containers/scenarios/types';
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
type ResponseInterventionsData = UseQueryResult<Intervention[]>;
type QueryParams = {
  sort?: string;
  pageParam?: number;
  searchTerm?: string;
  include?: string;
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
  params: Record<string, unknown>;
  options?: UseQueryOptions<ResponseData, unknown, T>;
}) => {
  const { sort, filter, searchTerm } = useAppSelector(scenarios);

  //this should come from API
  const userId = '94757458-343444';
  const paramsResult = {
    ...(!!sort && { sort }),
    ...(filter === 'private' && { 'filter[userId]': userId }),
    ...(filter === 'public' && { 'filter[status]': filter }),
    ...(!!searchTerm && { 'filter[title]': searchTerm }),
    ...params,
  };

  const query = useQuery(
    ['scenariosList', sort, paramsResult],
    () =>
      apiService
        .request<ResponseData>({
          method: 'GET',
          url: '/scenarios',
          params: paramsResult,
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

export function useInfiniteScenarios(QueryParams: QueryParams): ResponseInfiniteData {
  const { searchTerm, ...restParams } = QueryParams;
  const fetchScenarios = ({ pageParam = 1 }) =>
    apiService.request({
      method: 'GET',
      url: '/scenarios',
      params: {
        'page[number]': pageParam,
        ...(!!searchTerm && { 'filter[title]': searchTerm }),
        ...restParams,
      },
    });

  const query = useInfiniteQuery(['scenariosList', QueryParams], fetchScenarios, {
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

export function useScenario(id: Scenario['id']): ResponseDataScenario {
  const response: ResponseDataScenario = useQuery(
    ['scenario', id],
    () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${id}`,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, enabled: !!id && id !== 'actual-data' },
  );

  return useMemo<ResponseDataScenario>((): ResponseDataScenario => response, [response]);
}

export function useScenarioInterventions(id: Scenario['id']): ResponseInterventionsData {
  const response: ResponseInterventionsData = useQuery(
    ['interventions-by-scenario', id],
    () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${id}/interventions`,
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
  );
  return useMemo<ResponseInterventionsData>((): ResponseInterventionsData => response, [response]);
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation(
    (id: Scenario['id']) =>
      apiService.request({
        method: 'DELETE',
        url: `/scenarios/${decodeURIComponent(id as string)}`,
      }),
    {
      mutationKey: ['deleteScenario'],
      onSuccess: () => {
        queryClient.invalidateQueries(['scenariosList']);
      },
    },
  );
}

export function useUpdateScenario() {
  const updateScenario = ({ id, data }) =>
    apiService.request({
      method: 'PATCH',
      data,
      url: `/scenarios/${decodeURIComponent(id)}`,
    });

  return useMutation(updateScenario, {
    mutationKey: ['editScenario'],
  });
}

export function useCreateScenario() {
  const createScenario = (data) =>
    apiService.request({
      method: 'POST',
      url: '/scenarios',
      data,
    });

  return useMutation(createScenario, {
    mutationKey: ['createScenario'],
  });
}
