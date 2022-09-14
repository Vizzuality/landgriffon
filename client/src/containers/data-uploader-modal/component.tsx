import { useEffect, useRef, useState } from 'react';

import { DownloadIcon } from '@heroicons/react/solid';

import Button from 'components/button';
import Loading from 'components/loading';
import Modal from 'components/modal';
import Uploader from 'containers/uploader';

import type { UploadDataSourceModalProps } from './types';
import DataUploader from 'containers/data-uploader';

const UploadDataSourceModal: React.FC<UploadDataSourceModalProps> = ({
  open,
  onDismiss,
}: UploadDataSourceModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false);

  const uploaderRef = useRef({ upload: null });

  useEffect(() => {
    if (open) return;
    setFiles([]);
    setIsUploading(false);
    setUploaded(false);
  }, [open]);

  return (
    <Modal title="Upload data source" open={open} onDismiss={onDismiss}>
      <div>
        <p className="text-sm text-gray-500">
          Upload a new file will replace all the current data.
        </p>
        <div className="mt-10">
          <DataUploader inline />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        {!uploaded && (
          <Button theme="secondary" onClick={onDismiss}>
            Cancel
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default UploadDataSourceModal;
