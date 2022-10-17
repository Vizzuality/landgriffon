import { useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { ErrorResponse } from 'types';
import type { UseQueryResult, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type { Intervention, InterventionDto } from 'containers/interventions/types';

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

const INTERVENTIONS_INDICATORS_DATA = [
  {
    description:
      'The different terrestrial ecosystems play an important role storing carbon on the below-ground plant organic matter and soil. Particularly forest, through growth of trees and the increase of soil carbon, contain a large part of the carbon stored on land.\n\nActivities such us land use change or deforestation may affect carbon storage producing a disturbance of the carbon pools that may be released into the atmosphere.\n\nCarbon emissions due to land use change would therefore be the release of carbon into the atmosphere driven by the change from forest into a specific agriculture commodity.',
    id: 'GHG_LUC_T',
    metadata: {},
    name: 'Carbon emissions',
    value: 0,
    unit: 'tCO2e/T',
  },
  {
    description: 'Deforestation risk due to ...',
    id: 'DF_LUC_T',
    metadata: {},
    name: 'Deforestation risk',
    value: 0,
    unit: 'Ha/T',
  },
  {
    description: 'With the Unsustainable water use indicator...',
    id: 'UWU_T',
    metadata: {},
    name: 'Water withdrawal',
    value: 0,
    unit: '100m3/T',
  },
  {
    description: 'Land use and land use change...',
    id: 'BL_LUC_T',
    metadata: {},
    name: 'Biodiversity impact',
    value: 0,
    unit: 'PDF/T',
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

export function useScenarioInterventions({
  scenarioId,
  params = {},
  options = {},
}: {
  scenarioId: string;
  params?: Record<string, unknown>;
  options?: Partial<UseQueryOptions>;
}) {
  const query = useQuery(
    ['scenarioInterventions', scenarioId, params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenarios/${scenarioId}/interventions`,
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, ...options, enabled: !!scenarioId },
  );
  return query as ResponseInterventionsData;
}

export function useIntervention({
  interventionId,
  params = {},
  options = {},
}: {
  interventionId: string;
  params?: Record<string, unknown>;
  options?: Partial<UseQueryOptions>;
}) {
  const query = useQuery(
    ['fetchIntervention', interventionId, params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: `/scenario-interventions/${interventionId}`,
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      enabled: (options.enabled ?? true) && !!interventionId,
    },
  );
  return query as UseQueryResult<Intervention>;
}

export function useInterventions(queryParams = {}): ResponseInterventionsData {
  const response = useQuery(
    ['interventionsList', queryParams],
    () =>
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

interface InterventionCreationResponse {
  attributes: { title: Intervention['title'] };
  id: Intervention['id'];
  type: Intervention['type'];
}

export const useCreateNewIntervention = (
  options?: UseMutationOptions<InterventionCreationResponse, ErrorResponse, InterventionDto>,
) => {
  const createIntervention = (data: InterventionDto) =>
    apiService
      .request<InterventionCreationResponse>({
        method: 'POST',
        url: '/scenario-interventions',
        data,
      })
      .then(({ data }) => data);

  return useMutation(createIntervention, {
    mutationKey: ['createIntervention'],
    ...options,
  });
};

export function useDeleteIntervention() {
  const deleteIntervention = (id: string) =>
    apiService.request({
      method: 'DELETE',
      url: `/scenario-interventions/${id}`,
    });

  return useMutation(deleteIntervention, {
    mutationKey: ['deleteIntervention'],
  });
}

export function useUpdateIntervention() {
  const updateIntervention = ({
    id,
    data,
  }: {
    id: string;
    data: Partial<Omit<InterventionDto, 'id'>>;
  }) =>
    apiService.request({
      method: 'PATCH',
      data,
      url: `/scenario-interventions/${decodeURIComponent(id)}`,
    });

  return useMutation(updateIntervention, {
    mutationKey: ['editIntervention'],
  });
}

export function useInterventionsIndicators(queryParams = {}): ResponseInterventionsIndicators {
  const response = useQuery(
    ['interventionsIndicators', queryParams],
    () =>
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
