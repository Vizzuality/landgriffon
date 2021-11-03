import { useQuery } from 'react-query';
import yearsService from 'services/years';

export function useYears() {
  // const [session] = useSession();

  const result = useQuery(
    ['years'],
    async () =>
      yearsService
        .request<number[]>({
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

  return {
    ...result,
    data: result.data,
  };
}
