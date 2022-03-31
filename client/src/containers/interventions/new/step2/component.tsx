import { useCallback, FC } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { setNewInterventionStep } from 'store/features/analysis/scenarios';

import Button from 'components/button';

import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { scenarios } from 'store/features/analysis/scenarios';

const Step2: FC = () => {
  const dispatch = useAppDispatch();

  const { newInterventionData } = useAppSelector(scenarios);
  const { type } = newInterventionData;

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
  }, [dispatch]);

  const handleIntervention = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, [dispatch]);

  return (
    <>
      {type === 'new-material' && <Material />}
      {(type === 'new-supplier-location' || type === 'new-material') && <Supplier />}
      <SupplierImpact />
      <div className="pt-5">
        <div className="flex justify-end">
          <Button type="button" onClick={handleCancel} theme="secondary">
            Cancel
          </Button>
          <Button
            // type="button"
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleIntervention}
          >
            Add intervention
          </Button>
        </div>
      </div>
    </>
  );
};

export default Step2;
