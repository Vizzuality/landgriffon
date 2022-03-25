import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions, useMutation } from 'react-query';
import type { Intervention } from 'containers/scenarios/types';
import { apiService } from 'services/api';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
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

type ResponseInterventionsData = UseQueryResult<Intervention[]>;

export function useInterventions(queryParams: { sort: string }): ResponseInterventionsData {
  const response = useQuery(
    ['interventionsList', queryParams],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/scenario-interventions',
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

export function useCreateNewIntervention() {
  const createIntervention = ({ data }) =>
    apiService.request({
      method: 'POST',
      url: '/scenario-interventions',
      data,
    });

  return useMutation(createIntervention, {
    mutationKey: 'addIntervention',
    onSuccess: () => {
      console.info('Success creating intervention');
    },
    onError: () => {
      console.info('Error');
    },
  });
}
