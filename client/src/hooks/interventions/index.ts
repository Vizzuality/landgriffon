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

type ResponseInterventionsData = UseQueryResult<Intervention[]>;

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
