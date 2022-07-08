import { useMemo } from 'react';
import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  UseQueryResult,
  useMutation,
  UseInfiniteQueryResult,
} from 'react-query';

import { useAppSelector } from 'store/hooks';

import { scenarios } from 'store/features/analysis/scenarios';

import { apiService } from 'services/api';
import { AxiosResponse } from 'axios';

// types
import type { Scenario } from 'containers/scenarios/types';
import type { Intervention } from 'containers/scenarios/types';

type ResponseData = UseQueryResult<Scenario[]>;
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

export function useScenarios(params = {}, options = {}): ResponseData {
  const { sort, filter, searchTerm } = useAppSelector(scenarios);

  //this should come from API
  const userId = '94757458-343444';

  const response: ResponseData = useQuery<Scenario[]>(
    ['scenariosList', sort, filter, searchTerm],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/scenarios',
          params: {
            ...(!!sort && { sort }),
            ...(filter === 'private' && { 'filter[userId]': userId }),
            ...(filter === 'public' && { 'filter[status]': filter }),
            ...(!!searchTerm && { 'filter[title]': searchTerm }),
            ...params,
          },
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: [],
      ...options,
    },
  );
  return useMemo((): ResponseData => response, [response]);
}

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
    async () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${id}`,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, enabled: id !== 'actual-data' },
  );

  return useMemo<ResponseDataScenario>((): ResponseDataScenario => response, [response]);
}

export function useScenarioInterventions(id: Scenario['id']): ResponseInterventionsData {
  const response: ResponseInterventionsData = useQuery(
    ['interventions-by-scenario', id],
    async () =>
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
      mutationKey: 'deleteScenario',
      onSuccess: () => {
        queryClient.invalidateQueries('scenariosList');
      },
      onError: () => {
        console.info('Error');
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
    mutationKey: 'editScenario',
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
    mutationKey: 'createScenario',
    onSuccess: () => {
      console.info('Success creating a new scenario');
    },
    onError: () => {
      console.info('Error');
    },
  });
}
