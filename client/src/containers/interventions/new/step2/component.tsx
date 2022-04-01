import { useCallback, FC, useMemo } from 'react';
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

import { analysisFilters } from 'store/features/analysis/filters';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { scenarios, setNewInterventionStep } from 'store/features/analysis/scenarios';

import { useCreateNewIntervention } from 'hooks/interventions';

import toast from 'react-hot-toast';

const getSchemaValidation = (interventionType) => {
  switch (interventionType) {
    case 'new-supplier-location':
      return yup.object({
        newT1SupplierId: yup.string(),
        newProducerId: yup.string(),
        newLocationType: yup.string().required(),
        newLocationCountryInput: yup.string().required(),
        newLocationAddressInput: yup.string().required(),
        DF_LUC_T: yup.number().required(),
        UWU_T: yup.number().required(),
        BL_LUC_T: yup.number().required(),
        GHG_LUC_T: yup.number().required(),
      });
      break;
    case 'production-efficiency':
      return yup.object({
        DF_LUC_T: yup.number().required(),
        UWU_T: yup.number().required(),
        BL_LUC_T: yup.number().required(),
        GHG_LUC_T: yup.number().required(),
      });
      break;
    default:
      return yup.object({
        newMaterialId: yup.string().required(),
        newMaterialTonnageRatio: yup.number().required(),
        newT1SupplierId: yup.string(),
        newProducerId: yup.string(),
        newLocationType: yup.string().required(),
        newLocationCountryInput: yup.string().required(),
        newLocationAddressInput: yup.string().required(),
        DF_LUC_T: yup.number().required(),
        UWU_T: yup.number().required(),
        BL_LUC_T: yup.number().required(),
        GHG_LUC_T: yup.number().required(),
      });
  }
};

const Step2: FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { interventionType } = filters;
  const { currentScenario } = useAppSelector(scenarios);

  const schemaValidation = useMemo(() => getSchemaValidation(interventionType), [interventionType]);

  const methods = useForm({
    resolver: yupResolver(schemaValidation),
  });

  // const {
  //   getValues,
  // } = methods;

  const { newInterventionData } = useAppSelector(scenarios);

  const createIntervention = useCreateNewIntervention();
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
        type: newInterventionData.type,
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

      createIntervention.mutate(parsedData, {
        onSuccess: () => {
          toast.success('A new intervention has been created');
        },
        onError: () => {
          toast.success('There has been a problem creating the intervemtion');
        },
      });
    },
    [currentScenario, newInterventionData, createIntervention],
  );

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
  }, [dispatch]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleStepsSubmissons)} className="mt-16">
        {interventionType === 'new-material' && <Material />}
        {(interventionType === 'new-supplier-location' || interventionType === 'new-material') && (
          <Supplier />
        )}
        <SupplierImpact />
        <div className="mt-8">
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
