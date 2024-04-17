import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';

import { useUploadDataSource } from '@/hooks/sourcing-data';
import { LAST_TASK_PARAMS, useLasTask } from '@/hooks/tasks';
import { env } from '@/env.mjs';
import FileDropzone from '@/components/file-dropzone';

import type { FileDropZoneProps } from '@/components/file-dropzone/types';
import type { Task } from 'types';

type DataUploaderProps = {
  variant?: 'default' | 'inline'; // Visually it removes a shadow when it's true
  onUploadInProgress?: (inProgress: boolean) => void;
};

const uploadOptions = {
  accept: {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  maxSize: env.NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE,
};

const DataUploader: React.FC<DataUploaderProps> = ({ variant = 'default', onUploadInProgress }) => {
  const [currentTaskId, setCurrentTaskId] = useState<Task['id']>(null);
  const router = useRouter();
  const uploadDataSource = useUploadDataSource();
  const lastTask = useLasTask();
  const queryClient = useQueryClient();

  const handleOnDrop: FileDropZoneProps['onDrop'] = useCallback(
    (acceptedFiles) => {
      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('file', file);
      });

      uploadDataSource.mutate(formData, {
        onSuccess: ({ data }) => {
          const { attributes, ...rest } = data;
          queryClient.setQueryData(['tasks', LAST_TASK_PARAMS], {
            data: [
              {
                ...rest,
                ...attributes,
              },
            ],
          });
        },
        onError: ({ response }) => {
          const errors = response?.data?.errors;
          if (errors && !!errors.length) {
            errors.forEach(({ title }) => toast.error(title));
          } else {
            toast.error('There was an error uploading the file. Try again later.');
          }
        },
      });
    },
    [uploadDataSource, queryClient],
  );

  const handleFileRejected: FileDropZoneProps['onDropRejected'] = useCallback((rejectedFiles) => {
    rejectedFiles.forEach(({ errors }) => {
      errors.forEach(({ code }) => {
        if (code === 'file-invalid-type') {
          toast.error('File type is not supported');
        }
      });
    });
  }, []);

  // Status of the uploading process
  const isUploading = uploadDataSource.isLoading;
  const isWaiting = uploadDataSource.isSuccess && currentTaskId === lastTask.data?.id;
  const isTaskFailed = lastTask.data?.status === 'failed';
  const isWorking = (isUploading || isWaiting) && !isTaskFailed;
  const isCompleted = !isWorking && uploadDataSource.isSuccess;

  useEffect(() => {
    if (!currentTaskId && lastTask.data?.id) {
      setCurrentTaskId(lastTask.data.id);
    }
  }, [currentTaskId, lastTask.data?.id]);

  useEffect(() => {
    if (isCompleted) onUploadInProgress?.(false);
  }, [isCompleted, onUploadInProgress, router]);

  useEffect(() => {
    if (isWorking && onUploadInProgress) onUploadInProgress?.(true);
  }, [isWorking, onUploadInProgress]);

  return (
    <div className="relative w-full">
      <div
        className={classNames('relative z-10 rounded-xl bg-white', {
          'p-4 shadow-lg': variant === 'default',
        })}
      >
        <FileDropzone
          {...uploadOptions}
          onDrop={handleOnDrop}
          onDropRejected={handleFileRejected}
          disabled={isWorking}
          isUploading={isWorking}
        />
      </div>
    </div>
  );
};

export default DataUploader;
