import { responseSymbol } from 'next/dist/server/web/spec-compliant/fetch-event';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import { apiRawService } from 'services/api';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

type SourcingRecordsYearsData = number[];
type SourcingRecordsYearsResponse = UseQueryResult<SourcingRecordsYearsData>;

export function useSourcingRecordsYears(): SourcingRecordsYearsResponse {
  const result = useQuery<SourcingRecordsYearsData>(
    ['SourcingRecordYears'],
    async () =>
      apiRawService
        .request<SourcingRecordsYearsData>({
          method: 'GET',
          url: '/sourcing-records/years',
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      select: (responseData) => responseData.data,
    },
  );
  return result as SourcingRecordsYearsResponse;
}
