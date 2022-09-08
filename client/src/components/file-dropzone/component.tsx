import { useDropzone } from 'react-dropzone';

import UploadIcon from 'components/icons/upload-icon';

import { bytesToMegabytes } from 'utils/units';

import type { FileDropZoneProps } from './types';

const defaultDropzoneProps: FileDropZoneProps = {
  multiple: false,
  maxFiles: 1,
  maxSize: 10000000,
};

const FileDropZone: React.FC<FileDropZoneProps> = (dropZoneOptions) => {
  const options = {
    ...defaultDropzoneProps,
    ...dropZoneOptions,
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(options);

  return (
    <div
      {...getRootProps({
        className:
          'bg-primary/5 px-4 py-10 text-sm text-center border-2 border-gray-200 border-dashed rounded-md',
      })}
    >
      <input {...getInputProps()} />

      <div className="space-y-1">
        <div className="flex justify-center w-full mb-4">
          <UploadIcon />
        </div>

        {isDragActive ? (
          <p className="text-primary">Drop the file here</p>
        ) : (
          <p>
            <strong className="text-primary">Upload a file</strong> or drag and drop
          </p>
        )}
        <p className="text-xs">
          Max supported file: XLS {Number(bytesToMegabytes(options.maxSize)).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
};

export default FileDropZone;
