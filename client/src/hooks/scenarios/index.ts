import { useMemo } from 'react';
import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseQueryOptions,
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
};

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<Scenario[]> = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

const DEFAULT_INFINITE_QUERY_OPTIONS = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: 'actual-data', // reserved id only for actual-data
  title: 'Actual data',
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
    DEFAULT_QUERY_OPTIONS,
  );
  return useMemo((): ResponseData => {
    const data: ResponseData['data'] =
      response.isSuccess && response.data
        ? [ACTUAL_DATA, ...(response.data as Scenario[])]
        : response.data;
    return {
      ...response,
      data,
    } as ResponseData;
  }, [response]);
}

export function useInfiniteScenarios(QueryParams: QueryParams): ResponseInfiniteData {
  const fetchScenarios = ({ pageParam = 1 }) =>
    apiService.request({
      method: 'GET',
      url: '/scenarios',
      params: {
        'page[number]': pageParam,
        ...QueryParams,
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

export function useScenario(id: string, queryParams: { sort: string }): ResponseDataScenario {
  const { sort, filter, searchTerm } = useAppSelector(scenarios);

  const response = useQuery(
    ['scenario', queryParams],
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

  return useMemo<ResponseDataScenario>((): ResponseDataScenario => {
    const data = response.isSuccess && response.data ? response.data : (ACTUAL_DATA as Scenario);
    return {
      ...response,
      data,
    } as ResponseDataScenario;
  }, [response]);
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
  const updateProject = ({ id, data }) =>
    apiService.request({
      method: 'PATCH',
      data,
      url: `/scenarios/${decodeURIComponent(id)}`,
    });

  return useMutation(updateProject, {
    mutationKey: 'editScenario',
  });
}

export function useCreateScenario() {
  const createScenario = (data) =>
    apiService.request({
      method: 'POST',
      url: '/scenario',
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
