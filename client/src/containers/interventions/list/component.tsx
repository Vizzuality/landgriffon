import type { FC } from 'react';
import { useCallback, useState } from 'react';
import classNames from 'classnames';

import Button from 'components/button';

// actions
import {
  setSubContentCollapsed,
  setInterventionMode,
  setCurrentIntervention,
} from 'store/features/analysis';

// hooks
import { useDeleteIntervention, useUpdateIntervention } from 'hooks/interventions';
import { useAppDispatch } from 'store/hooks';

import toast from 'react-hot-toast';

// types
import type { ScenarioInterventionsGrowthItems } from 'containers/scenarios/types';

const InterventionsList: FC<ScenarioInterventionsGrowthItems> = ({
  items,
}: ScenarioInterventionsGrowthItems) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState({});
  const [isDisabled, setDisabled] = useState({});

  const handleToggleOpen = useCallback(
    (e, id) => {
      e.preventDefault();
      setIsOpen((prev) => ({
        prev: false,
        [id]: !prev[id],
      }));
    },
    [setIsOpen],
  );

  const deleteIntervention = useDeleteIntervention();
  const updateIntervention = useUpdateIntervention();

  const handleDelete = useCallback(
    (id) => {
      deleteIntervention.mutate(id, {
        onSuccess: () => {
          toast.success('Intervention succesfully deleted.');
        },
        onError: () => {
          toast.error('There was a problem deleting the intervention.');
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

  const handleDisable = useCallback(
    (e, id) => {
      e.stopPropagation();
      const status = !!isDisabled[id] ? 'active' : 'inactive';
      const sucessMessage = {
        active: 'The intervention has been disabled',
        inactive: 'There intervention has been enabled',
      };
      const errorMessage = {
        active: 'There was a problem enabling the intervention',
        inactive: 'There was a problem disabling the intervention',
      };
      updateIntervention.mutate(
        {
          id,
          data: {
            status,
          },
        },
        {
          onSuccess: () => {
            toast.success(sucessMessage[status]);
          },
          onError: () => {
            toast.error(errorMessage[status]);
          },
        },
      );
      setDisabled((prev) => ({
        prev: false,
        [id]: !prev[id],
      }));
    },
    [updateIntervention, isDisabled],
  );

  return items?.length > 0 ? (
    <ul className="text-sm bg-white rounded-md mt-4">
      {items.map(({ id, title }, index) => (
        <li
          key={id}
          className={classNames(
            'pointer-events-auto px-4 py-4 sm:px-6 border first:rounded-t-md last:rounded-b-md',
            {
              ' bg-green-50': isOpen[id] && !isDisabled[id],
              'border-gray-30': !isOpen[id],
              'border-y-green-700': isOpen[id] && index !== 0 && index !== items.length - 1,
              'first:border-t-gray-30 first:border-b-green-700 last:border-t-green-700 last:border-t-gray-3':
                isOpen[id] && (index === 0 || index === items.length - 1),
              'bg-gray-100 text-gray-500': !!isDisabled[id],
            },
          )}
          onClick={(e) => handleToggleOpen(e, id)}
        >
          {title}
          {isOpen[id] && (
            <>
              <p
                className={classNames(
                  'text-sm py-4',
                  !!isDisabled[id] ? 'text-gray-500' : 'text-green-700',
                )}
              >
                New contract with sustainability assesment.
              </p>
              <div className="flex justify-start space-x-2">
                <Button theme="secondary" size="xs" onClick={() => handleDelete(id)}>
                  Delete
                </Button>
                <Button theme="secondary" size="xs" onClick={(e) => handleDisable(e, id)}>
                  {!!isDisabled[id] ? 'Enable' : 'Disable'}
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
