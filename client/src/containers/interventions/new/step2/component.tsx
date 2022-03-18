import { FC, useCallback } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';
import { setNewInterventionStep, setNewInterventionData } from 'store/features/analysis/scenarios';

import Button from 'components/button';


// form validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { analysisFilters } from 'store/features/analysis/filters';

import type { StepProps } from 'containers/interventions/new/types';

const schemaValidation = yup.object({
  supplier: yup.string().required(),
  producer: yup.string().required(),
  locationType: yup.string().required(),
  country: yup.string().required(),
  address: yup.string().required(),
});

const Step2: FC<StepProps> = ({ handleCancel }: StepProps) => {
  const dispatch = useAppDispatch();

  const filters = useAppSelector(analysisFilters);

  const { interventionType } = filters;

  const {
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const handleStepsSubmissons = useCallback(
    (values) => {
      if (isValid) dispatch(setNewInterventionData(values));
    },
    [dispatch, isValid],
  );

  return (
    <form onSubmit={handleSubmit(handleStepsSubmissons)}>
      {interventionType === 'new-supplier-location' && <Material />}
      {(interventionType === 'new-supplier-location' || interventionType === 'new-material') && (
        <Supplier />
      )}
      <SupplierImpact />
      <div className="pt-5">
        <div className="flex justify-end">
          <Button type="button" onClick={handleCancel} theme="secondary">
            Cancel
          </Button>
          <Button
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={!isValid}
            onClick={handleStepsSubmissons}
          >
            Add intervention
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Step2;
