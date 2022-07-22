import { useEffect, useRef, useState } from 'react';

import { DownloadIcon } from '@heroicons/react/solid';

import Button from 'components/button';
import Loading from 'components/loading';
import Modal from 'components/modal';
import Uploader from 'containers/uploader';

import type { UploadDataSourceModalProps } from './types';

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

  const hasFilesSelected = files?.length > 0;

  return (
    <Modal title="Upload data source" open={open} onDismiss={onDismiss}>
      <Uploader
        disabled={uploaded}
        url="/import/sourcing-data"
        fileTypes={['xlsx']}
        header="Upload the complete data file to update the data source"
        footer={
          <a
            className="flex mt-4 underline text-xs cursor-pointer"
            href="/files/data-template.xlsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Excel template
          </a>
        }
        onSelected={(files, { upload }) => {
          uploaderRef.current = { upload };
          setFiles(files);
        }}
        onUploading={() => setIsUploading(true)}
        onUpload={() => {
          setIsUploading(false);
          setUploaded(true);
        }}
        onError={() => setIsUploading(false)}
      />

      <div className="flex justify-end gap-3 mt-8">
        {!uploaded && (
          <Button theme="secondary" onClick={onDismiss}>
            Cancel
          </Button>
        )}
        <Button
          theme="primary"
          disabled={!hasFilesSelected || isUploading}
          onClick={() => {
            uploaded ? onDismiss() : uploaderRef.current.upload(files);
          }}
        >
          {uploaded ? (
            'Close'
          ) : isUploading ? (
            <>
              Uploading...
              <Loading className="ml-2" />
            </>
          ) : (
            'Confirm Upload'
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default UploadDataSourceModal;
