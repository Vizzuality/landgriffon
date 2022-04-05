import { useMemo } from 'react';
import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  useMutation,
  UseInfiniteQueryResult,
} from 'react-query';
import { useQueryClient } from 'react-query';

import { useAppSelector } from 'store/hooks';

import { scenarios } from 'store/features/analysis/scenarios';

import { apiService } from 'services/api';
import type { Scenario } from 'containers/scenarios/types';
import { AxiosResponse } from 'axios';

type ResponseData = UseQueryResult<Scenario[]>;
type ResponseInfiniteData = UseInfiniteQueryResult<
  AxiosResponse<{
    data: Scenario[];
    meta: Record<string, unknown>;
  }>
>;

type ResponseDataScenario = UseQueryResult<Scenario>;
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

export function useScenarios(): ResponseData {
  const { sort, filter, searchTerm } = useAppSelector(scenarios);

  //this should come from API
  const userId = '94757458-343444';
  const params = {
    ...(!!sort && { sort }),
    ...(filter === 'private' && { 'filter[userId]': userId }),
    ...(filter === 'public' && { 'filter[status]': filter }),
    ...(!!searchTerm && { 'filter[title]': searchTerm }),
  };

  const response: ResponseData = useQuery<Scenario[]>(
    ['scenariosList', sort, filter, searchTerm],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/scenarios',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: [],
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
  const { sort, filter, searchTerm } = useAppSelector(scenarios);

  const response: ResponseDataScenario = useQuery(
    ['scenario', id],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${id}`,
          params: { sort, 'filter[title]': searchTerm, filter },
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
  );

  return useMemo<ResponseDataScenario>((): ResponseDataScenario => response, [response]);
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
