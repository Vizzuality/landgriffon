import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRawService, apiService } from 'services/api';

import type { UseQueryResult, UseQueryOptions, UseMutationResult } from '@tanstack/react-query';
import type { APIMetadataPagination, ErrorResponse, Task } from 'types';
import type { AxiosResponse } from 'axios';

type TaskAPIResponse = Task;

type TasksAPIResponse = AxiosResponse<{
  data: Task[];
  meta: APIMetadataPagination;
}>;

const DEFAULT_QUERY_OPTIONS = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
};

export const useTasks = (
  params: Record<string, string | number | boolean> = {},
  options: UseQueryOptions<TasksAPIResponse> = {},
) => {
  const query = useQuery<TasksAPIResponse, ErrorResponse>(
    ['tasks', params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/tasks',
          params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
};

export const useLasTask = () => {
  const tasks = useTasks(
    {
      'page[size]': 1,
      'page[number]': 1,
      sort: '-createdAt',
      include: 'user',
    },
    {
      refetchInterval: 20000,
      refetchOnReconnect: true,
    },
  );

  return { ...tasks, data: tasks?.data?.data?.[0] };
};

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

export function useUpdateTask(): UseMutationResult<TaskAPIResponse> {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: Task['id']; data: Partial<Task> }) =>
      apiService.request({
        method: 'PATCH',
        data,
        url: `/tasks/${decodeURIComponent(id)}`,
      }),
    {
      mutationKey: ['updateTask'],
      onSettled: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    },
  );
}

export function useTaskErrors(
  id: Task['id'],
  options: UseQueryOptions<string> = {},
): UseQueryResult<string> {
  const query = useQuery<string>(
    ['task-error', id],
    () =>
      apiRawService
        .request({
          method: 'GET',
          url: `/tasks/report/errors/${id}`,
          params: {
            type: 'sourcing_data_import',
          },
        })
        .then(({ data: responseData }) => responseData),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );
  return query;
}
