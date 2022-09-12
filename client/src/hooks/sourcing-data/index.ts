import { useMutation } from '@tanstack/react-query';
import { apiRawService } from 'services/api';

import type { UseMutationResult } from '@tanstack/react-query';

type ApiResponse = { data: { id: string } };

export function useUploadDataSource(): UseMutationResult<ApiResponse> {
  const importDataSource = (data) =>
    apiRawService
      .request({
        method: 'POST',
        data,
        url: 'import/sourcing-data',
      })
      .then((response) => response.data);

  return useMutation<ApiResponse>(importDataSource, {
    mutationKey: ['importSourcingData'],
  });
}
