import { useMemo } from 'react';
import { useQuery } from 'react-query';
import analysisService from 'services/analysis';
import MOCK from './mock';

export function useAnalysisChart() {
  // const [session] = useSession();

  const query = useQuery(['analysis-chart'], async () =>
    analysisService
      .request({
        method: 'GET',
        url: `/`,
        headers: {
          // Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          // include: 'scenarios,users',
        },
      })
      .then((response) => response.data)
  );

  const { data } = query;

  return useMemo(() => {
    const parsedData = MOCK;

    console.log(parsedData);

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data?.data]);
}
