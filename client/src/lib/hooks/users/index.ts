import { useMemo } from 'react';
import { useQueryClient } from 'react-query';
import USERS from 'services/users';

export function useUsers(session) {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery('me', () =>
    USERS.request({
      method: 'GET',
      url: '/me',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }).then((response) => response.data),
  );

  return useMemo(() => {
    return {
      queryClient,
    };
  }, [queryClient]);
}
