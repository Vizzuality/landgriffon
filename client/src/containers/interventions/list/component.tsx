import { FC, useCallback, useState } from 'react';

import Button from 'components/button';

import { useDeleteIntervention } from 'hooks/interventions';

import toast from 'react-hot-toast';

// types
import type { ScenarioInterventionsGrowthItems } from 'containers/scenarios/types';
import type { ErrorResponse } from 'types';
import classNames from 'classnames';

const InterventionsList: FC<ScenarioInterventionsGrowthItems> = ({
  items,
}: ScenarioInterventionsGrowthItems) => {
  const [isOpen, setIsOpen] = useState({});

  const handleToggleOpen = useCallback(
    (id) =>
      setIsOpen((prev) => ({
        ...prev,
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

  return items?.length > 0 ? (
    <ul className="text-sm bg-white rounded-md mt-4">
      {items.map(({ id, title }) => (
        <li
          key={id}
          className={classNames(
            'px-4 py-4 sm:px-6 border first:rounded-t-md last:rounded-b-md',
            isOpen[id] ? 'bg-green-50 border-green-700' : 'border-gray-30',
          )}
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
                <Button size="xs">Edit</Button>
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
