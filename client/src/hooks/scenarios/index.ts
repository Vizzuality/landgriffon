import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import { getScenarios } from 'services/scenarios';
import type { Scenario } from 'containers/scenarios/types';

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

export function useScenarios(queryParams: { sort: string }): ResponseData {
  const response = useQuery(
    ['scenariosList', queryParams],
    async () => getScenarios(queryParams),
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

export function useInterventionType(intervention: string) {
  const interventionTypes = [
    {
      id: 1,
      title: 'Source from a new supplier or location',
    },
    {
      id: 2,
      title: 'Change production efficiency',
    },
    {
      id: 3,
      title: 'Switch to a new material',
    },
  ];
  return useMemo<number>(
    () => interventionTypes.find(({ title }) => intervention === title).id,
    [intervention],
  );
}
