import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import { useUploadDataSource } from 'hooks/sourcing-data';
import { useLasTask } from 'hooks/tasks';
import FileDropzone from 'components/file-dropzone';

import type { FileDropZoneProps } from 'components/file-dropzone/types';
import type { Task } from 'types';

type DataUploaderProps = {
  variant?: 'default' | 'inline'; // Visually it removes a shadow when it's true
  onUploadInProgress?: (inProgress: boolean) => void;
};

const MAX_SIZE = Number(process.env.NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE || '10000000');

const uploadOptions = {
  accept: {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  maxSize: MAX_SIZE,
};

const DataUploader: React.FC<DataUploaderProps> = ({ variant = 'default', onUploadInProgress }) => {
  const [currentTaskId, setCurrentTaskId] = useState<Task['id']>(null);
  const router = useRouter();
  const uploadDataSource = useUploadDataSource();
  const lastTask = useLasTask();
  const { refetch: refetchLastTask } = lastTask;

  const handleOnDrop: FileDropZoneProps['onDrop'] = useCallback(
    (acceptedFiles) => {
      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('file', file);
      });

      uploadDataSource.mutate(formData, {
        onSuccess: () => {
          refetchLastTask();
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
    [refetchLastTask, uploadDataSource],
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
  const isProcessing = lastTask.data?.status === 'processing';
  const isWorking = isUploading || isWaiting || isProcessing;
  const isCompleted =
    !isWorking &&
    uploadDataSource.isSuccess &&
    (lastTask.data?.status === 'completed' || lastTask.data?.status === 'failed');

  useEffect(() => {
    if (!currentTaskId && lastTask.data?.id) {
      setCurrentTaskId(lastTask.data.id);
    }
  }, [currentTaskId, lastTask.data?.id]);

  useEffect(() => {
    if (isCompleted && router.isReady) {
      router.reload();
      onUploadInProgress(false);
    }
  }, [isCompleted, onUploadInProgress, router]);

  useEffect(() => {
    if (isWorking && onUploadInProgress) {
      onUploadInProgress(true);
    }
  }, [isWorking, onUploadInProgress]);

  return (
    <div className="relative w-full min-w-[640px]">
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

      {isWorking && (
        <div className="w-full px-20">
          <div className="rounded-b-xl bg-white px-10 py-4">
            <div className="h-[4px] w-full rounded bg-gradient-to-r from-[#5FCFF9] via-[#42A56A] to-[#F5CA7D]" />
            <p className="mt-1 text-left text-xs text-gray-500">
              {isUploading && 'Uploading file...'}
              {isWaiting && 'File uploaded successfully! Starting to process the data...'}
              {isProcessing && 'Processing file...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUploader;
