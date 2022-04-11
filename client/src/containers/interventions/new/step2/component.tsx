import { useCallback, FC } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';

// form validation
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// components
import Button from 'components/button';
import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { scenarios, setNewInterventionStep } from 'store/features/analysis/scenarios';

import { useCreateNewIntervention, useUpdateIntervention } from 'hooks/interventions';

import toast from 'react-hot-toast';

const schemaValidation = yup.object({
  newMaterialId: yup.string().when('type', {
    is: 'Switch to a new material',
    then: yup.string().required(),
  }),
  newMaterialTonnageRatio: yup.number().when('type', {
    is: 'Switch to a new material',
    then: yup.string().required(),
  }),
  newT1SupplierId: yup.string(),
  newProducerId: yup.string(),
  newLocationType: yup.string().when('type', {
    is: 'Switch to a new material' || 'Source from a new supplier or location',
    then: yup.string().required(),
  }),
  newLocationCountryInput: yup.string().when('type', {
    is: 'Switch to a new material' || 'Source from a new supplier or location',
    then: yup.string().required(),
  }),
  newLocationAddressInput: yup.string().when('type', {
    is: 'Switch to a new material' || 'Source from a new supplier or location',
    then: yup.string().required(),
  }),
  DF_LUC_T: yup.number().required(),
  UWU_T: yup.number().required(),
  BL_LUC_T: yup.number().required(),
  GHG_LUC_T: yup.number().required(),
});

const errorMessage = 'Please complete all the missing fields';

const Step2: FC = () => {
  const dispatch = useAppDispatch();
  const { currentScenario, interventionMode, currentIntervention } = useAppSelector(scenarios);

  const methods = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const {
    formState: { errors },
  } = methods;

  const hasErrors = Object.keys(errors).length > 0;

  const { newInterventionData } = useAppSelector(scenarios);
  const { type } = newInterventionData;

  const createIntervention = useCreateNewIntervention();
  const updateIntervention = useUpdateIntervention();

  const handleStepsSubmissons = useCallback(
    (values) => {
      const parsedData = {
        scenarioId: currentScenario,
        title: newInterventionData.title,
        interventionDescription: newInterventionData.interventionDescription,
        percentage: newInterventionData.percentage,
        materialsIds: newInterventionData.materialsIds,
        businessUnitsIds: newInterventionData.businessUnitsIds,
        startYear: newInterventionData.endYear,
        endYear: newInterventionData.endYear,
        type,
        suppliersIds: newInterventionData.suppliersIds,
        adminRegionsIds: newInterventionData.adminRegionsIds,
        newMaterialTonnageRatio: values.newMaterialTonnageRatio,
        newMaterialId: values.newMaterialId,
        newT1SupplierId: values.newT1SupplierId,
        newProducerId: values.newProducerId,
        newLocationType: values.newLocationType,
        newLocationCountryInput: values.newLocationCountryInput,
        newLocationAddressInput: values.newLocationAddressInput,
        newIndicatorCoefficients: {
          DF_LUC_T: values.DF_LUC_T,
          UWU_T: values.UWU_T,
          BL_LUC_T: values.BL_LUC_T,
          GHG_LUC_T: values.GHG_LUC_T,
        },
      };

      if (interventionMode === 'create') {
        createIntervention.mutate(parsedData, {
          onSuccess: () => {
            toast.success('A new intervention has been created');
          },
          onError: () => {
            toast.error('There has been a problem creating the intervention');
          },
        });
      }

      if (interventionMode === 'edit') {
        updateIntervention.mutate(
          {
            id: currentIntervention,
            data: {
              ...parsedData,
            },
          },
          {
            onSuccess: () => {
              toast.success('The intervention has been updated');
            },
            onError: () => {
              toast.error('There has been a problem creating the intervention');
            },
          },
        );
      }
    },
    [
      currentScenario,
      currentIntervention,
      newInterventionData,
      type,
      createIntervention,
      interventionMode,
      updateIntervention,
    ],
  );

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
  }, [dispatch]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleStepsSubmissons)} className="mt-16">
        {type === 'Switch to a new material' && <Material />}
        {(type === 'Source from a new location or supplier' ||
          type === 'Switch to a new material') && <Supplier />}
        <SupplierImpact />
        <div className="pt-10 flex justify-between items-center">
          {hasErrors && (
            <div className="mt-2 text-sm text-red-600">
              <p className="first-letter:uppercase">{errorMessage}</p>
            </div>
          )}
          <div className="flex justify-end flex-1">
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
