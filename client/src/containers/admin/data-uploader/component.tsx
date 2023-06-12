import { useState } from 'react';
import { DownloadIcon } from '@heroicons/react/solid';

import DataUploadError from 'containers/admin/data-upload-error';
import DataUploader from 'containers/uploader';
import { Anchor } from 'components/button';

import type { Task } from 'types';

const AdminDataPage: React.FC<{ task: Task }> = ({ task }) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="space-y-16">
        <div className="space-y-4 text-lg text-center">
          <p className="font-semibold">
            1. Download the Excel template and fill it with your data.
          </p>
          <Anchor
            href="/files/data-template.xlsx"
            download
            target="_blank"
            rel="noopener noreferrer"
            icon={<DownloadIcon aria-hidden="true" />}
          >
            Download template
          </Anchor>
        </div>
        <div className="space-y-4 text-lg text-center w-[640px]">
          <p className="font-semibold">2. Upload the filled Excel file.</p>
          <DataUploader onUploadInProgress={setIsUploading} />
          {!isUploading && task?.status === 'failed' && <DataUploadError task={task} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDataPage;
