import { FC, useCallback, useState } from 'react';

import Button from 'components/button';

// actions
import {
  setSubContentCollapsed,
  setInterventionMode,
  setCurrentIntervention,
} from 'store/features/analysis';

// hooks
import { useDeleteIntervention } from 'hooks/interventions';

import toast from 'react-hot-toast';

// types
import type { ScenarioInterventionsGrowthItems } from 'containers/scenarios/types';
import type { ErrorResponse } from 'types';
import classNames from 'classnames';
import { useAppDispatch } from 'store/hooks';

const InterventionsList: FC<ScenarioInterventionsGrowthItems> = ({
  items,
}: ScenarioInterventionsGrowthItems) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState({});

  const handleToggleOpen = useCallback(
    (id) =>
      setIsOpen((prev) => ({
        prev: false,
        [id]: !prev[id],
      })),
    [setIsOpen],
  );

  const deleteIntervention = useDeleteIntervention();

  const handleDelete = useCallback(
    (id) => {
      deleteIntervention.mutate(id, {
        onSuccess: () => {
          toast.success('Intervention succesfully deleted.');
        },
        onError: (error: ErrorResponse) => {
          const { errors } = error.response?.data;
          errors.forEach(({ title }) => toast.error(title));
        },
      });
    },
    [deleteIntervention],
  );

  const handleEdit = useCallback(
    (id) => {
      setIsOpen({ isOpen, [id]: true });
      dispatch(setInterventionMode('edit'));
      dispatch(setCurrentIntervention(id));
      dispatch(setSubContentCollapsed(false));
    },
    [dispatch, isOpen],
  );

  return items?.length > 0 ? (
    <ul className="text-sm bg-white rounded-md mt-4">
      {items.map(({ id, title }, index) => (
        <li
          key={id}
          className={classNames('px-4 py-4 sm:px-6 border first:rounded-t-md last:rounded-b-md', {
            ' bg-green-50': isOpen[id],
            'border-gray-30': !isOpen[id],
            'border-y-green-700': isOpen[id] && index !== 0 && index !== items.length - 1,
            'first:border-t-gray-30 first:border-b-green-700 last:border-t-green-700 last:border-t-gray-3':
              isOpen[id] && (index === 0 || index === items.length - 1),
          })}
          onClick={() => handleToggleOpen(id)}
        >
          {title}
          {isOpen[id] && (
            <>
              <p className="text-sm text-green-700 py-4">
                New contract with sustainability assesment.
              </p>
              <div className="flex justify-start space-x-2">
                <Button theme="secondary" size="xs" onClick={() => handleDelete(id)}>
                  Delete
                </Button>
                <Button theme="secondary" size="xs">
                  Disable
                </Button>
                <Button size="xs" onClick={() => handleEdit(id)}>
                  Edit
                </Button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="mt-4 text-sm text-center">
      Each intervention is a specific change in sourcing. Create an intervention to get started
    </p>
  );
};

export default InterventionsList;
