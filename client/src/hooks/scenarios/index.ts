import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import { apiService } from 'services/api';
import type { Scenario, Intervention } from 'containers/scenarios/types';

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

const INTERVENTIONS_DATA = [
  {
    id: 1,
    title: 'Replace 50% of Palm Oil with Soybean Oil (RFA-certified) by 2025',
  },
  {
    id: 2,
    title: 'Change supplier of Rubber for pep.a.1.001 to Namazie International in 2022',
  },
  {
    id: 3,
    title: 'Change production efficiency of Palm oil for pep.a1 in 2 regions by 2025',
  },
  {
    id: 4,
    title: 'Change production efficiency of Cocoa for pep.a1 in 2 regions by 2025',
  },
];

type ResponseData = UseQueryResult<Scenario[]>;
type ResponseDataScenario = UseQueryResult<Scenario>;
type ResponseInterventionsData = UseQueryResult<Intervention[]>;

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

export function useInterventions(queryParams: { sort: string }): ResponseInterventionsData {
  const response = useQuery(
    ['interventionsList', queryParams],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenario-intervention`,
          params: queryParams,
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
  );

  return useMemo<ResponseInterventionsData>((): ResponseInterventionsData => {
    const data = response.isSuccess && response.data ? response.data : INTERVENTIONS_DATA;
    //response.data;
    return {
      ...response,
      data,
    } as ResponseInterventionsData;
  }, [response]);
}
