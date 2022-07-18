import { useQuery, UseQueryOptions } from 'react-query';

import { apiRawService } from 'services/api';

type SourcingRecordsYearsData = number[];

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<SourcingRecordsYearsData> = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

export function useSourcingRecordsYears({
  params = {},
  options = {},
}: {
  params: Record<string, unknown>;
  options: UseQueryOptions<SourcingRecordsYearsData>;
}) {
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
