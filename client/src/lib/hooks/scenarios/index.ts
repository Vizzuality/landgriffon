/* eslint-disable prettier/prettier */
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { getScenarios } from 'services/scenarios';
import type { Scenario } from 'containers/scenarios/types';

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: 'actual-data', // reserved id only for actual-data
  title: 'Actual data',
};

export function useScenarios(queryParams) {
  const response = useQuery(['scenariosList', queryParams], async () => getScenarios(queryParams), {
    retry: false,
  });
  const data =
    response.isSuccess && response.data
      ? {
        ...response,
        // injecting actual data
        data: [ACTUAL_DATA, ...response.data],
      }
      : response;

  return useMemo(() => {
    return {
      data,
    };
  }, [response, data, queryParams]);
}
