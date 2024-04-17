import { useMutation } from '@tanstack/react-query';

import { apiRawService } from 'services/api';
import { Task } from '@/types';

export function useUploadDataSource() {
  const importDataSource = (data: FormData) =>
    apiRawService
      .request<{
        data: {
          id: Task['id'];
          type: Task['type'];
          attributes: Omit<Task, 'id' | 'type'>;
        };
      }>({
        method: 'POST',
        data,
        url: 'import/sourcing-data',
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response.data);

  return useMutation(importDataSource, {
    mutationKey: ['importSourcingData'],
  });
}
