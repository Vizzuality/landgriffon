import { useQuery } from '@tanstack/react-query';
import { apiService } from 'services/api';

import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import type { APIMetadataPagination } from 'types';

type Task = {
  id: string;
  type: string;
  status: string;
  errors?: Record<string, string>[];
};

type TaskAPIResponse = Task;

type TasksAPIResponse = {
  data: Task[];
  meta: APIMetadataPagination;
};

const DEFAULT_QUERY_OPTIONS = {
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

export type LocationType = {
  label: string;
  value: 'point-of-production' | 'aggregation-point' | 'country-of-production' | 'unknown';
};

export function useTasks(
  options: UseQueryOptions<TasksAPIResponse> = {},
): UseQueryResult<TasksAPIResponse> {
  const query = useQuery<TasksAPIResponse>(
    ['tasks'],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/tasks',
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
}

export function useTask(
  id: Task['id'],
  options: UseQueryOptions<TaskAPIResponse> = {},
): UseQueryResult<TaskAPIResponse> {
  const query = useQuery<TaskAPIResponse>(
    ['tasks', id],
    () =>
      apiService
        .request({
          method: 'GET',
          url: `/tasks/${id}`,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
}
