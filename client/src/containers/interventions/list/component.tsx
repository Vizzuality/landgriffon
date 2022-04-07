import { FC, useCallback, useState } from 'react';
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

// utils
import { listElementsJoiner } from 'utils';

// types
import type { Intervention } from 'containers/scenarios/types';

const InterventionsList: FC<{ items: Intervention[] }> = ({ items }: { items: Intervention[] }) => {
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

  const produccionEfficiencyTemplate = (props) => {
    const { endYear } = props;
    // TO DO - change newMaterial for material[] when API is ready
    const materials = ['Palm oil'];
    const materialsDisplay = listElementsJoiner(materials);
    const suppliers = ['pep.a1', 'pep.a1', 'pep.a1'];
    const suppliersDisplay = listElementsJoiner(suppliers);
    const sourcingLocations = ['loc21', 'loc2'];
    const sourcingLocationsDisplay =
      sourcingLocations.length > 1 ? `${sourcingLocations?.length} regions` : sourcingLocations[0];

    return (
      <p>
        Change production efficiency of <span className="font-bold">{materialsDisplay} </span>
        for <span className="font-bold">{suppliersDisplay} </span>
        in <span className="font-bold">{sourcingLocationsDisplay} </span>
        by {endYear}.
      </p>
    );
  };

  const newSupplierTemplate = (props) => {
    const { newT1Supplier, newProducer, newGeoRegion, endYear } = props;
    // TO DO - change newMaterial for material[] when API is ready
    const materials = ['Rubber', 'Rubber', 'Rubber'];

    const suppliers = ['pep.a.1.001'];
    const suppliersDisplay = listElementsJoiner(suppliers);
    const sourcingLocations = ['Namazie International'];
    const sourcingLocationsDisplay = sourcingLocations.join(',');
    const newSourcingLocations = newGeoRegion.sourcingLocations;
    const materialsDisplay = listElementsJoiner(materials);
    const locations =
      newSourcingLocations.length > 1
        ? `${newSourcingLocations?.length} regions`
        : sourcingLocations[0];
    return (
      <p>
        Change supplier of <span className="font-bold">{materialsDisplay} </span>
        for <span className="font-bold">{suppliersDisplay} </span>
        in <span className="font-bold">{sourcingLocationsDisplay} </span>
        to <span className="font-bold">{newT1Supplier.name} </span>
        to <span className="font-bold">{newProducer.name} </span>
        in <span className="font-bold">{locations} </span>
        in {endYear}.
      </p>
    );
  };

  const newMaterialTemplate = (props) => {
    const { percentage, newMaterial, endYear } = props;

    // TO DO - change newMaterial for material[] when API is ready
    const materials = ['Palm oil'];
    const materialsDisplay = listElementsJoiner(materials);
    return (
      <p>
        Replace {percentage}% of <span className="font-bold">{materialsDisplay} </span>
        with <span className="font-bold">{newMaterial.name} </span>
        by {endYear}.
      </p>
    );
  };

  return items?.length > 0 ? (
    <ul className="text-sm bg-white rounded-md mt-4">
      {items.map(({ id, type, ...props }, index) => (
        <li
          key={id}
          className={classNames(
            'pointer-events-auto px-4 py-4 sm:px-6 border first:rounded-t-md last:rounded-b-md cursor-pointer hover:bg-green-50',
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
          {type === 'Change production efficiency' && produccionEfficiencyTemplate(props)}
          {type === 'Source from a new supplier or location' && newSupplierTemplate(props)}
          {type === 'Switch to a new material' && newMaterialTemplate(props)}
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
