import { FC, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { formatPercentage } from '@/utils/number-format';
import useSocket from '@/hooks/socket';

const STEPS = [
  ['VALIDATING_DATA', 'Validating Data'],
  ['GEOCODING', 'Geocoding'],
  ['IMPORTING_DATA', 'Importing Data'],
  ['CALCULATING_IMPACT', 'Calculating Impact'],
] as const;

type ProgressTask = {
  kind: 'DATA_IMPORT_PROGRESS';
  data: Record<
    (typeof STEPS)[number][0],
    {
      status: 'processing' | 'idle' | 'completed';
      progress: number;
    }
  >;
};

export const UploadTracker: FC = () => {
  const queryClient = useQueryClient();
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [tasksProgress, setTaskProgress] = useState<ProgressTask['data'] | undefined>(undefined);

  const onProgress = useCallback(
    ({ data }: ProgressTask) => {
      if (isSettingUp) setIsSettingUp(false);
      setTaskProgress(data);
    },
    [isSettingUp],
  );

  const onComplete = useCallback(() => {
    queryClient.invalidateQueries(['tasks']);
    queryClient.invalidateQueries(['sourcingLocations']);
  }, [queryClient]);

  const onFailure = useCallback(() => {
    queryClient.invalidateQueries(['tasks']);
  }, [queryClient]);

  useSocket({
    DATA_IMPORT_PROGRESS: onProgress,
    DATA_IMPORT_COMPLETED: onComplete,
    DATA_IMPORT_FAILURE: onFailure,
  });

  const isCompleted = tasksProgress?.[STEPS[STEPS.length - 1][0]]?.status === 'completed';

  return (
    <div className="h-[124px] w-full rounded-3xl bg-white px-8 py-10">
      {(isSettingUp || isCompleted) && (
        <div className="flex h-full items-center justify-center text-gray-900">
          {isSettingUp && <p>Retrieving the status of the upload. Please, wait a moment.</p>}
          {isCompleted && (
            <p>Data has been processed successfully. Results will be displayed soon.</p>
          )}
        </div>
      )}
      {!isSettingUp && !isCompleted && (
        <div className="grid grid-cols-4 gap-1">
          {STEPS.map(([key, name]) => (
            <div className="flex flex-col items-start" key={key}>
              <span
                className={cn('text-base text-gray-400 transition-colors', {
                  'text-gray-900': ['processing', 'completed'].includes(
                    tasksProgress?.[key]?.status,
                  ),
                })}
              >
                {name}
              </span>
              <span className="text-sm text-gray-500">{`Progress: ${
                tasksProgress?.[key]?.progress
                  ? formatPercentage(tasksProgress[key].progress / 100)
                  : '–'
              }`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadTracker;
