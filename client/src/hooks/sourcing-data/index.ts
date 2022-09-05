import { useMutation } from 'react-query';
import { apiRawService } from 'services/api';

import type { UseMutationResult } from 'react-query';

type ApiResponse = { data: { id: string } };

export function useUploadDataSource(): UseMutationResult<ApiResponse> {
  const updateScenario = (data) =>
    apiRawService
      .request({
        method: 'POST',
        data,
        url: 'import/sourcing-data',
      })
      .then((response) => response.data);

  return useMutation<ApiResponse>(updateScenario, {
    mutationKey: 'editScenario',
  });
}
