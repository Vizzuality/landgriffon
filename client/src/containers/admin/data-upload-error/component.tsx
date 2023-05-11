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
  // Do not show disclaimer if there is not any error and task is completed
  if (task?.status === 'completed' && task?.errors.length === 0) return null;

  return (
    <Disclaimer variant={VARIANT_STATUS[task.status] || 'default'}>
      <div className="flex w-full space-x-6 items-center">
        <div className="space-y-1.5 flex-1">
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
                {/* {format(new Date(sourcingLocations.data[0].updatedAt), 'MMM 4, yyyy HH:mm z')}. We */}
                have <strong className="text-gray-900">reverted to the previous version</strong> to
                avoid data loss. Please{' '}
                <strong className="text-gray-900">
                  download your file to see the {task.errors.length} error
                  {task.errors.length > 1 && 's'}
                </strong>
                , correct them and try uploading again.
              </p>
            </>
          )}
        </div>
        <div className="flex-none">
          <Button variant="white" disabled>
            Download
          </Button>
        </div>
      </div>
    </Disclaimer>
  );
};

export default DataUploadError;
