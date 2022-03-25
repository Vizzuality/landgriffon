import { FC, useCallback, useMemo } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useCreateNewIntervention } from 'hooks/interventions';

import { setNewInterventionData } from 'store/features/analysis/scenarios';

import Button from 'components/button';

// form validation
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { analysisFilters } from 'store/features/analysis/filters';
import { scenarios } from 'store/features/analysis/scenarios';

import type { StepProps } from 'containers/interventions/new/types';

// const schemaValidation = yup.object({
//   supplier: yup.string().required(),
//   producer: yup.string().required(),
//   locationType: yup.string().required(),
//   country: yup.string().required(),
//   address: yup.string().required(),
// });

const Step2: FC<StepProps> = ({ handleCancel }: StepProps) => {
  const dispatch = useAppDispatch();

  const filters = useAppSelector(analysisFilters);
  const { newInterventionData } = useAppSelector(scenarios);

  const { interventionType } = filters;

  const getSchemaValidation = (interventionType) => {
    switch (interventionType) {
      case 'new-supplier-location':
        return yup.object({
          newT1SupplierId: yup.string().required(),
          newProducerId: yup.string().required(),
          newLocationType: yup.string().required(),
          newLocationCountryInput: yup.string().required(),
          newLocationAddressInput: yup.string().required(),
        });
        break;
      case 'production-efficiency':
        return yup.object({
          newIndicatorCoefficients: yup.object({
            DF_LUC_T: yup.number().required(),
            UWU_T: yup.number().required(),
            BL_LUC_T: yup.number().required(),
            GHG_LUC_T: yup.number().required(),
          }),
        });
        break;
      default:
        return yup.object({
          percentage: yup.number().required(),
          newMaterialId: yup.string().required(),
          newMaterialTonnageRatio: yup.number().required(),
        });
    }
  };

  const schemaValidation = useMemo(() => getSchemaValidation(interventionType), [interventionType]);

  const methods = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const {
    formState: { isValid },
  } = methods;

  const createIntervention = useCreateNewIntervention();
  const handleStepsSubmissons = useCallback(
    (values) => {
      console.log(values, 'valores')
      if (isValid) {
        dispatch(setNewInterventionData(values));
        return createIntervention.mutate(
          { ...newInterventionData },
          {
            onSuccess: (data) => {
              console.log('onsucces', data);
            },
            onError: (error, variables, context) => {
              console.log('error', error, variables, context);
            },
          },
        );
      }
    },
    [dispatch, isValid, newInterventionData, createIntervention],
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleStepsSubmissons)} className="mt-16">
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
              // disabled={!isValid}
              type="submit"
            >
              Add intervention
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default Step2;
