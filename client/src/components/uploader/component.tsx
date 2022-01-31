import { useMemo, useEffect, useState, useCallback } from 'react';

import Image from 'next/image';
// import { useSession } from 'next-auth/client';
import { useDropzone } from 'react-dropzone';

import { FILE_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { apiService } from 'services/api';
import { bytesToMegabytes } from 'utils/units';

import Alerts, { AlertsItemProps } from 'components/alerts';

import { UploaderProps } from './types';

const Uploader: React.FC<UploaderProps> = ({
  header,
  footer,
  key = 'file',
  url,
  fileTypes,
  maxFiles = 1,
  maxSize = FILE_UPLOADER_MAX_SIZE,
  autoUpload = true,
  showAlerts = true,
  onSelected,
  onRejected,
  onUpload,
  onError,
}: UploaderProps) => {
  // const [session] = useSession();

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertsItemProps>(null);

  const uploadFiles = useCallback(() => {
    if (!(files.length > 0)) return;
    if (!url) return;

    const formData = new FormData();
    files.forEach((file) => formData.append(key, file));

    apiService
      .request({
        method: 'POST',
        url: url,
        data: formData,
        headers: {
          // Authorization: `Bearer ${session.accessToken}`,
        },
      })
      .then((response) => {
        onUpload && onUpload(response);
        if (showAlerts) {
          setAlert({
            type: 'success',
            title: 'Your file was successfully uploaded.',
          });
        }
      })
      .catch(({ request }) => {
        onError && onError(request);
        if (showAlerts) {
          try {
            const errors = JSON.parse(request.response).errors.map(({ title }) => title);

            setAlert({
              type: 'error',
              title: errorAlertTitle(errors),
              messages: errors,
            });
          } catch {
            setAlert({
              type: 'error',
              title: 'There was an error uploading your file. Please try again.',
            });
          }
        }
      })
      .finally(() => {
        setIsUploading(false);
      });
  }, [files, key, onError, onUpload, showAlerts, url]);

  const fileTypesString = useMemo(() => {
    return (fileTypes || []).map((fileType) => fileType.toUpperCase()).join(', ');
  }, [fileTypes]);

  const errorAlertTitle = (errors) => {
    return `There was ${errors.length} error${
      errors.length > 1 ? 's' : ''
    } with your file. Please correct ${errors.length > 1 ? 'them' : 'it'} and try again.`;
  };

  const onDropAccepted = async (files: File[]) => {
    setFiles(files);
    onSelected && onSelected(files, { upload: uploadFiles });
    if (autoUpload) {
      setIsUploading(true);
      uploadFiles();
    }
  };

  const onDropRejected = async (dropErrors) => {
    setIsUploading(false);
    onRejected && onRejected(dropErrors);

    if (showAlerts) {
      // TODO: handle all the files errors.
      //       Currently we're only dealing with the first file's errors.
      //       It suits our existing use case but it may not, in the future.
      const errors = dropErrors[0].errors.map((error) => {
        switch (error.code) {
          case 'file-too-large':
            return `File is larger than ${bytesToMegabytes(maxSize)}MB`;
          default:
            return error.message;
        }
      });

      setAlert({
        type: 'error',
        title: errorAlertTitle(errors),
        messages: errors,
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: fileTypes && fileTypes.map((f) => '.' + f),
    disabled: !!isUploading,
    maxSize,
    maxFiles,
    multiple: maxFiles > 1,
    onDropAccepted,
    onDropRejected,
  });

  useEffect(() => {
    if (isUploading) setAlert(null);
  }, [isUploading]);

  useEffect(() => {
    if (!(files.length > 0)) return;
    if (!autoUpload) return;
    uploadFiles();
  }, [autoUpload, files, uploadFiles]);

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
        <p className="text-gray-500 text-xs mt-1">
          {isUploading ? 'Uploading file...' : `${fileTypesString} ${bytesToMegabytes(maxSize)}MB`}
        </p>
      </div>
      {footer && <div className="text-sm mt-3">{footer}</div>}

      <Alerts className="-mb-4" items={alert} />
    </div>
  );
};

export default Uploader;
