import { useCallback } from 'react';
import toast from 'react-hot-toast';
import classNames from 'classnames';

import { useUploadDataSource } from 'hooks/sourcing-data';
import FileDropzone from 'components/file-dropzone';

import type { FileDropZoneProps } from 'components/file-dropzone/types';

type DataUploaderProps = {
  variant?: 'default' | 'inline'; // Visually it removes a shadow when it's true
  isProcessing?: boolean; // Overriding the processing state
};

const MAX_SIZE = Number(process.env.NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE || '10000000');

const uploadOptions = {
  accept: {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  maxSize: MAX_SIZE,
};

const DataUploader: React.FC<DataUploaderProps> = ({
  variant = 'default',
  isProcessing = false,
}) => {
  const uploadDataSource = useUploadDataSource();

  const handleOnDrop: FileDropZoneProps['onDrop'] = useCallback(
    (acceptedFiles) => {
      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('file', file);
      });

      uploadDataSource.mutate(formData, {
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

  const isUploadingOrProcessing = uploadDataSource.isLoading || isProcessing;

  return (
    <div className="relative w-[640px]">
      <div
        className={classNames('relative z-10 bg-white rounded-xl', {
          'p-4 shadow-lg': variant === 'default',
        })}
      >
        <FileDropzone
          {...uploadOptions}
          onDrop={handleOnDrop}
          onDropRejected={handleFileRejected}
          disabled={isUploadingOrProcessing}
          isUploading={isUploadingOrProcessing}
        />
      </div>

      {isUploadingOrProcessing && (
        <div className="w-full px-20">
          <div className="px-10 py-4 bg-white rounded-b-xl">
            <div className="w-full h-[4px] rounded bg-gradient-to-r from-[#5FCFF9] via-[#42A56A] to-[#F5CA7D]" />
            <p className="mt-1 text-xs text-left text-gray-500">
              {uploadDataSource.isLoading && 'Uploading file...'}
              {isProcessing && 'Processing file...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUploader;
