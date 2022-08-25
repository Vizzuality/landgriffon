import { apiRawService } from 'services/api';
import { useQuery } from '@tanstack/react-query';

import type { UseQueryOptions } from '@tanstack/react-query';

type SourcingRecordsYearsData = number[];

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<SourcingRecordsYearsData> = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};
export function useSourcingRecordsYears(
  props: {
    params?: Record<string, unknown>;
    options?: UseQueryOptions<SourcingRecordsYearsData>;
  } = {},
) {
  const { params = {}, options = {} } = props;
  const result = useQuery<SourcingRecordsYearsData>(
    ['SourcingRecordYears'],
    async () =>
      apiRawService
        .request<{ data: SourcingRecordsYearsData }>({
          method: 'GET',
          params,
          url: '/sourcing-records/years',
        })
        .then((response) => response.data?.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return result;
}
