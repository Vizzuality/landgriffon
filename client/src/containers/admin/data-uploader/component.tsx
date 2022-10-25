import { DownloadIcon, XCircleIcon } from '@heroicons/react/solid';

import DataUploader from 'containers/uploader';
import { Anchor } from 'components/button';

import type { Task } from 'types';

const AdminDataPage: React.FC<{ task: Task }> = ({ task }) => {
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
        <div className="space-y-4 text-lg text-center">
          <p className="font-semibold">2. Upload the filled Excel file.</p>
          <DataUploader isProcessing={task?.status === 'processing'} />

          {task?.errors.length > 0 && (
            <div className="p-4 mt-6 text-sm text-left text-red-400 rounded-md bg-red-50">
              <p>
                <XCircleIcon className="inline-block w-5 h-5 mr-2 text-red-400 align-top" />
                There {task.errors.length === 1 ? 'is' : 'are'} {task.errors.length} error
                {task.errors.length > 1 && 's'} with your file. Please correct them and try again.
              </p>
              <ul className="pl-12 mt-2 space-y-2 list-disc">
                {task.errors.map((error) =>
                  Object.values(error).map((errorMessage) => (
                    <li key={errorMessage}>{errorMessage}</li>
                  )),
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDataPage;
