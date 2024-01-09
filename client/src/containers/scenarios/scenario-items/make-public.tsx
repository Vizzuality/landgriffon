import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

import Toggle from 'components/toggle';
import { useUpdateScenario } from 'hooks/scenarios';
import { handleResponseError } from 'services/api';

import type { MakePublicProps } from '../types';

const MakePublic = ({ id, isPublic, display, canEditScenario }: MakePublicProps) => {
  const queryClient = useQueryClient();
  const updateScenario = useUpdateScenario();

  const handleChangeVisibility = useCallback(
    (isActive: boolean) => {
      updateScenario.mutate(
        { id: id, data: { isPublic: isActive } },
        {
          onSuccess: () => {
            toast.success('Your changes were successfully saved.');
            queryClient.invalidateQueries(['scenariosList']);
            queryClient.invalidateQueries(['scenario', id]);
          },
          onError: handleResponseError,
        },
      );
    },
    [id, updateScenario, queryClient],
  );

  return (
    <div>
      <div
        className={classNames('flex items-center space-x-1', {
          'bg-navy-50': isPublic,
          'bg-gray-100': !isPublic,
          'justify-center rounded-md p-6': display === 'list',
          '-mx-6 p-6': display === 'grid',
        })}
      >
        <Toggle
          data-testid="scenario-visibility"
          active={isPublic}
          onChange={handleChangeVisibility}
          disabled={!canEditScenario}
        />
        <span className="text-sm text-gray-500 peer-disabled:text-gray-300">
          Make scenario public
        </span>
      </div>
    </div>
  );
};

export default MakePublic;
