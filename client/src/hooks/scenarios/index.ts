import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions, useMutation } from 'react-query';
import { useQueryClient } from 'react-query';
import { apiService } from 'services/api';
import type { Scenario, Intervention } from 'containers/scenarios/types';
import { useRouter } from 'next/router';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
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

type ResponseData = UseQueryResult<Scenario[]>;
type ResponseDataScenario = UseQueryResult<Scenario>;

export function useScenarios(queryParams: { sort: string }): ResponseData {
  const response = useQuery(
    ['scenariosList', queryParams],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/scenarios',
          params: queryParams,
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
  );

  return useMemo<ResponseData>((): ResponseData => {
    const data =
      response.isSuccess && response.data
        ? [ACTUAL_DATA, ...(response.data as Scenario[])]
        : response.data;
    return {
      ...response,
      data,
    } as ResponseData;
  }, [response]);
}

export function useScenario(id: string, queryParams: { sort: string }): ResponseDataScenario {
  const response = useQuery(
    ['scenario', queryParams],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${id}`,
          params: queryParams,
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
  const { query } = useRouter();
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
        queryClient.invalidateQueries(['scenariosList', { sort: query.sort }]);
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

  // request body
  // {
  //   "title": "string",
  //   "description": "string",
  //   "status": "string",
  //   "metadata": "string"
  // }

  return useMutation(updateProject, {
    mutationKey: 'editScenario',
    onSuccess: () => {
      console.info('Success editing scenario');
    },
    onError: () => {
      console.info('Error');
    },
  });
}
