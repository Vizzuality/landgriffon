import { DownloadIcon } from '@heroicons/react/solid';

import DataUploadError from '@/containers/admin/data-upload-error';
import { Anchor } from '@/components/button';
import UploadTracker from '@/containers/uploader/tracker';
import { useLasTask } from '@/hooks/tasks';
import DataUploader from '@/containers/uploader';

const AdminDataUploader: React.FC = () => {
  const { data: lastTask } = useLasTask();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="space-y-16">
        <div className="space-y-4 text-center text-lg">
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
        <div className="flex flex-col items-center space-y-4 text-center text-lg">
          <p className="font-semibold">2. Upload the filled Excel file.</p>
          {lastTask?.status !== 'processing' && (
            <div className="w-[640px]">
              <DataUploader />
            </div>
          )}
          {lastTask?.status === 'processing' && (
            <div className="w-[880px]">
              <UploadTracker />
            </div>
          )}
          {lastTask?.status === 'failed' && <DataUploadError task={lastTask} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDataUploader;
