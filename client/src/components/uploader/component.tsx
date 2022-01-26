import { useMemo, useState } from 'react';

import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import { FILE_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { bytesToMegabytes } from 'utils/units';

import { UploaderProps } from './types';

const Uploader: React.FC<UploaderProps> = ({
  header,
  footer,
  fileTypes,
  maxFiles = 1,
  maxSize = FILE_UPLOADER_MAX_SIZE,
}: UploaderProps) => {
  const [files, setFiles] = useState([]);

  const onDropAccepted = async (files) => {
    setFiles(files);
    console.log('onDropAccepted', files);
  };

  const onDropRejected = async (files) => {
    console.log('onDropAccepted', files);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: fileTypes && fileTypes.map((f) => '.' + f),
    maxSize,
    maxFiles,
    multiple: maxFiles > 1,
    onDropAccepted,
    onDropRejected,
  });

  const fileTypesString = useMemo(() => {
    return (fileTypes || []).map((fileType) => fileType.toUpperCase()).join(', ');
  }, [fileTypes]);

  const fileNamesString = useMemo(() => {
    return (files || []).map((file) => file.name).join(', ');
  }, [files]);

  return (
    <div>
      {header && <div className="text-sm mb-3">{header}</div>}
      <div
        className="cursor-pointer rounded-md border-2 border-dashed py-10 px-4 text-center text-sm focus:outline-green-700"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Image src="/images/image-placeholder.svg" width="38" height="39" alt="Upload file" />
        <p className="mt-1">
          <span className="text-green-700">Upload a file</span> or drag and drop
        </p>
        {files?.length > 0 && <p className="text-gray-500 text-xs mt-1">{fileNamesString}</p>}
        <p className="text-gray-500 text-xs mt-1">
          {fileTypesString} {bytesToMegabytes(maxSize)}MB
        </p>
      </div>
      {footer && <div className="text-sm mt-3">{footer}</div>}
    </div>
  );
};

export default Uploader;
