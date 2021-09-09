import { useMemo } from 'react';
import { useQuery } from 'react-query';
import indicatorsService from 'services/indicators';

export function useIndicators() {
  // const [session] = useSession();

  const query = useQuery(
    ['indicators'],
    async () =>
      indicatorsService
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

  return useMemo(
    () => ({
      ...query,
      data,
    }),
    [query, data]
  );
}

export default useIndicators;
