import { useState } from 'react';
import { format } from 'date-fns';

import UploadIcon from 'components/icons/upload-icon';
import Disclaimer from 'components/disclaimer';
import Button from 'components/button';

import type { Task } from 'types';
import type { DisclaimerProps } from 'components/disclaimer/component';

const VARIANT_STATUS: Record<Task['status'], DisclaimerProps['variant']> = {
  completed: 'success',
  abort: 'error',
  failed: 'error',
  processing: 'warning',
};

type DataUploadErrorProps = {
  task: Task;
};

const DataUploadError: React.FC<DataUploadErrorProps> = ({ task }) => {
  const [open, setOpen] = useState(true);

  return (
    <Disclaimer
      open={open}
      variant={
        task?.status === 'completed' && task?.errors.length === 0
          ? 'default'
          : VARIANT_STATUS[task.status] || 'default'
      }
      icon={task?.status === 'completed' && task?.errors.length === 0 && <UploadIcon />}
    >
      <div className="flex w-full space-x-6 items-center">
        <div className="space-y-1.5 flex-1">
          {task?.status === 'completed' && task?.errors.length === 0 && (
            <>
              <h3>Upload completed</h3>
              <p className="text-gray-500">
                Great news! Your latest changes made on{' '}
                {format(new Date(task.createdAt), 'MMM 4, yyyy HH:mm z')} have been successfully
                uploaded.
              </p>
            </>
          )}

          {task?.status === 'completed' && task?.errors.length > 0 && (
            <>
              <h3>Upload completed with errors</h3>
              <p className="text-gray-500">
                We have successfully uploaded your file, but we have detected{' '}
                <strong className="text-gray-900">
                  {task.errors.length} error{task.errors.length > 1 && 's'}
                </strong>
                . To ensure accurate results, we recommend that you correct the errors before
                proceeding. Please{' '}
                <strong className="text-gray-900">download your file to see the errors</strong>,
                correct them and try
              </p>
            </>
          )}

          {task?.status === 'failed' && task?.errors.length > 0 && (
            <>
              <h3>Upload failed</h3>
              <p className="text-gray-500">
                Sorry, we couldn&apos;t upload your latest changes made on{' '}
                {format(new Date(task.createdAt), 'MMM 4, yyyy HH:mm z')}. We have{' '}
                <strong className="text-gray-900">reverted to the previous version</strong> to avoid
                data loss. There had been{' '}
                <strong className="text-gray-900">
                  {task.errors.length} error
                  {task.errors.length > 1 && 's'}
                </strong>
                . Please, correct them and try uploading again.
                {/* Please{' '}
                <strong className="text-gray-900">
                  download your file to see the {task.errors.length} error
                  {task.errors.length > 1 && 's'}
                </strong>
                , correct them and try uploading again. */}
              </p>
            </>
          )}
        </div>
        <div className="flex-none">
          {task?.status === 'completed' && task?.errors.length === 0 ? (
            <Button variant="white" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <Button variant="white" disabled>
              Download
            </Button>
          )}
        </div>
      </div>
    </Disclaimer>
  );
};

export default DataUploadError;