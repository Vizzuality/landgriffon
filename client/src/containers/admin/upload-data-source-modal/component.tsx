import { DownloadIcon } from '@heroicons/react/solid';

import Button from 'components/button';
import Modal from 'components/modal';
import Uploader from 'components/uploader';

import { UploadDataSourceModalProps } from './types';

const UploadDataSourceModal: React.FC<UploadDataSourceModalProps> = ({
  open,
  onDismiss,
}: UploadDataSourceModalProps) => {
  return (
    <Modal title="Upload data source" open={open} onDismiss={onDismiss}>
      <Uploader
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
      />

      <div className="flex justify-end gap-3 mt-8">
        <Button theme="secondary" onClick={onDismiss}>
          Cancel
        </Button>
        <Button theme="primary" onClick={() => console.info('Confirm')}>
          Confirm upload
        </Button>
      </div>
    </Modal>
  );
};

export default UploadDataSourceModal;
