import { useDropzone } from 'react-dropzone';
import Lottie from 'lottie-react';
import classNames from 'classnames';

import uploaderAnimation from './icon-animation.json';

import UploadIcon from 'components/icons/upload-icon';
import { bytesToMegabytes } from 'utils/units';

import type { FileDropZoneProps } from './types';

const defaultDropzoneProps: FileDropZoneProps = {
  multiple: false,
  maxFiles: 1,
  maxSize: 10000000,
};

const FileDropZone: React.FC<FileDropZoneProps> = ({ isUploading, ...dropZoneOptions }) => {
  const options = {
    ...defaultDropzoneProps,
    ...dropZoneOptions,
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(options);

  return (
    <div
      {...getRootProps({
        className: classNames(
          'h-[320px] flex items-center justify-center bg-white px-4 py-10 text-sm text-center border-2 border-gray-200 border-dashed rounded-md',
          {
            'bg-navy-50': isDragActive,
          },
        ),
      })}
    >
      <input {...getInputProps()} />

      <div className="space-y-1">
        <div className="mb-4 flex w-full justify-center">
          {isUploading ? (
            <Lottie animationData={uploaderAnimation} loop autoplay />
          ) : (
            <UploadIcon />
          )}
        </div>

        {!isUploading && (
          <>
            {isDragActive ? (
              <p className="text-navy-400">Drop the file here</p>
            ) : (
              <p>
                <strong className="font-semibold">
                  <span className="text-navy-400">Upload a file</span> or drag and drop
                </strong>
              </p>
            )}

            <p className="text-xs text-gray-500">
              Max supported file: XLS {Number(bytesToMegabytes(options.maxSize)).toFixed(2)} MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;
