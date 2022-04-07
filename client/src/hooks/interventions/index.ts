import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions, useMutation } from 'react-query';
import type { Intervention } from 'containers/scenarios/types';
import { apiService } from 'services/api';

import { INTERVENTIONS_DATA } from './contants';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

const INTERVENTIONS_INDICATORS_DATA = [
  {
    description:
      'The different terrestrial ecosystems play an important role storing carbon on the below-ground plant organic matter and soil. Particularly forest, through growth of trees and the increase of soil carbon, contain a large part of the carbon stored on land.\n\nActivities such us land use change or deforestation may affect carbon storage producing a disturbance of the carbon pools that may be released into the atmosphere.\n\nCarbon emissions due to land use change would therefore be the release of carbon into the atmosphere driven by the change from forest into a specific agriculture commodity.',
    id: 'GHG_LUC_T',
    metadata: {},
    name: 'Carbon emissions',
    value: 0,
    unit: 'tCO2e',
  },
  {
    description: 'Deforestation risk due to ...',
    id: 'DF_LUC_T',
    metadata: {},
    name: 'Deforestation risk',
    value: 0,
    unit: 'Ha',
  },
  {
    description: 'With the Unsustainable water use indicator...',
    id: 'UWU_T',
    metadata: {},
    name: 'Water withdrawal',
    value: 0,
    unit: '100m3',
  },
  {
    description: 'Land use and land use change...',
    id: 'BL_LUC_T',
    metadata: {},
    name: 'Biodiversity impact',
    value: 0,
    unit: 'PDF',
  },
];

interface Indicator {
  name: string;
  value: number;
  description: string;
  id: string;
  metadata: unknown;
  unit: string;
}

type ResponseInterventionsData = UseQueryResult<Intervention[]>;
type ResponseInterventionsIndicators = UseQueryResult<Indicator[]>;

export function useInterventions(queryParams = {}): ResponseInterventionsData {
  const response = useQuery(
    ['interventionsList', JSON.stringify(queryParams)],
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

    return {
      ...response,
      data,
    } as ResponseInterventionsData;
  }, [response]);
}

export function useCreateNewIntervention() {
  const createIntervention = (data) =>
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

export function useDeleteIntervention() {
  const deleteIntervention = (id) =>
    apiService.request({
      method: 'DELETE',
      url: `/scenario-interventions/${id}`,
    });

  return useMutation(deleteIntervention, {
    mutationKey: 'deleteIntervention',
    onSuccess: () => {
      console.info('The intervention has been deleted ');
    },
    onError: () => {
      console.info('Error');
    },
  });
}

export function useUpdateIntervention() {
  const updateIntervention = ({ id, data }) =>
    apiService.request({
      method: 'PATCH',
      data,
      url: `/scenario-interventions/${decodeURIComponent(id)}`,
    });

  return useMutation(updateIntervention, {
    mutationKey: 'editIntervention',
  });
}

export function useLocationTypes() {
  return useMemo<string[]>(() => {
    return ['point of production', 'aggregation point', 'country of production', 'unknown'];
  }, []);
}

export function useInterventionsIndicators(queryParams = {}): ResponseInterventionsIndicators {
  const response = useQuery(
    ['interventionsIndicators', JSON.stringify(queryParams)],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/interventions-indicators', // fakeURL
          params: queryParams,
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
  );

  return useMemo<ResponseInterventionsIndicators>((): ResponseInterventionsIndicators => {
    const data =
      response.isSuccess && response.data ? response.data : INTERVENTIONS_INDICATORS_DATA;
    //response.data;
    return {
      ...response,
      data,
    } as ResponseInterventionsIndicators;
  }, [response]);
}

export function useInterventionsIndicatorsCoefficients() {
  const { data: indicators } = useInterventionsIndicators();

  return useMemo<string[]>(() => indicators.map(({ id }) => id), [indicators]);
}
