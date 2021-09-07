import { useMemo } from 'react';
import { useQuery } from 'react-query';
import yearsService from 'services/years';

export function useYears() {
  // const [session] = useSession();

  const query = useQuery(
    ['years'],
    async () =>
      yearsService
        .request({
          method: 'GET',
          url: `/`,
          headers: {
            // Authorization: `Bearer ${session.accessToken}`,
          },
        })
        .then((response) => response.data),
    {
      keepPreviousData: true,
      placeholderData: [],
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data,
    };
  }, [query, data]);
}
