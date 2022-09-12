import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { XCircleIcon } from '@heroicons/react/solid';

import { useUploadDataSource } from 'hooks/sourcing-data';
import { useTask } from 'hooks/tasks';

import FileDropzone from 'components/file-dropzone';

import type { FileDropZoneProps } from 'components/file-dropzone/types';

const MAX_SIZE = Number(process.env.NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE || '10000000');

const uploadOptions = {
  accept: {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  maxSize: MAX_SIZE,
};

const UploadDataSourceModal: React.FC = () => {
  const [taskId, setTaskId] = useState<string>(null);
  const uploadDataSource = useUploadDataSource();

  const handleOnDrop: FileDropZoneProps['onDrop'] = useCallback(
    (acceptedFiles) => {
      setTaskId(null);

      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('file', file);
      });

      uploadDataSource.mutate(formData, {
        onSuccess: (response) => {
          setTaskId(response.data.id);
        },
        onError: () => {
          toast.error('There was an error uploading the file. Try again later.');
        },
      });
    },
    [uploadDataSource],
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

  const { data, isFetched, isLoading } = useTask(taskId, {
    enabled: !!taskId,
    refetchInterval: (data) => (data?.status === 'failed' ? false : 5000),
  });

  const isUploadingAndProcessing =
    (isFetched && isLoading) || uploadDataSource.isLoading || data?.status === 'processing';

  return (
    <div className="relative w-full max-w-[640px]">
      <div className="relative z-10 p-4 bg-white shadow-lg rounded-xl">
        <FileDropzone
          {...uploadOptions}
          onDrop={handleOnDrop}
          onDropRejected={handleFileRejected}
          disabled={isUploadingAndProcessing}
        />
      </div>

      {isUploadingAndProcessing && (
        <div className="absolute w-full px-20">
          <div className="px-10 py-4 bg-white rounded-b-xl">
            <div className="w-full h-[4px] rounded bg-gradient-to-r from-[#5FCFF9] via-[#42A56A] to-[#F5CA7D]" />
            <p className="text-xs text-left text-gray-500">
              {uploadDataSource.isLoading && 'Uploading file...'}
              {(isLoading || data?.status === 'processing') && 'Processing file...'}
            </p>
          </div>
        </div>
      )}

      {isFetched && !isLoading && !uploadDataSource.isLoading && data.errors.length > 0 && (
        <div className="p-4 mt-6 text-sm text-left text-red-600 rounded-md bg-red-50">
          <p>
            <XCircleIcon className="inline-block w-5 h-5 mr-2 text-red-600 align-top" />
            There {data.errors.length === 1 ? 'is' : 'are'} {data.errors.length} error
            {data.errors.length > 1 && 's'} with your file. Please correct them and try again.
          </p>
          <ul className="pl-12 mt-2 space-y-2 list-disc">
            {data.errors.map((error) =>
              Object.values(error).map((errorMessage) => (
                <li key={errorMessage}>{errorMessage}</li>
              )),
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadDataSourceModal;
