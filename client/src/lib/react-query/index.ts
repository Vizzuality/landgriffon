import { QueryClient } from '@tanstack/react-query';

// todo: when we are able to use RSC, use cache's React
const getQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

export default getQueryClient;
