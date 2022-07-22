import type { FC } from 'react';
import { useCallback, useMemo, useEffect, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useInterventionTypes } from 'hooks/analysis';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import type { ScenariosState } from 'store/features/analysis/scenarios';
import {
  scenarios,
  setNewInterventionStep,
  setNewInterventionData,
  resetInterventionData,
} from 'store/features/analysis/scenarios';
import { useCreateNewIntervention, useUpdateIntervention } from 'hooks/interventions';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import Select from 'components/select';
import Button from 'components/button';

import Materials from 'containers/interventions/smart-filters/materials/component';
import Suppliers from 'containers/interventions/smart-filters/suppliers/component';
import OriginRegions from 'containers/interventions/smart-filters/origin-regions/component';
import BusinessUnits from 'containers/interventions/smart-filters/business-units';

import toast from 'react-hot-toast';

// types
import type { SelectOption, SelectOptions } from 'components/select/types';
import { initialState } from 'store/features/analysis/scenarios';
const schemaValidation = yup.object({
  interventionDescription: yup.string(),
  percentage: yup.number().min(0).max(100).required(),
  materialIds: yup.array().min(1).required(),
  businessUnitIds: yup.array().min(1),
  supplierIds: yup.array().min(1),
  adminRegionIds: yup.array().min(1),
  endYear: yup
    .number()
    .test('len', 'Must be a valid year', (val) => Math.ceil(Math.log(val + 1) / Math.LN10) === 4)
    .required('error'), // year completion
  type: yup.string().required(),
});

const errorMessage = 'Please select all the missing fields';

const Step1: FC = () => {
  const dispatch = useAppDispatch();
  const interventionTypes = useInterventionTypes();
  const { currentScenario, interventionMode, currentIntervention, newInterventionData } =
    useAppSelector(scenarios);

  const { type } = newInterventionData;

  const optionsInterventionType: SelectOptions = useMemo(
    () =>
      interventionTypes.map(({ title, value }) => ({
        label: title,
        value: value,
      })),
    [interventionTypes],
  );

  const [resolver, setResolver] = useState(schemaValidation);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    resetField,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: optionsInterventionType[0].value,
    } as FieldValues,
    resolver: yupResolver(resolver),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const formValues = getValues();
  const { businessUnitIds, supplierIds, adminRegionIds, materialIds } = formValues;

  const currentInterventionType = watch('type');
  const selectedInterventionOption = useMemo(
    () => optionsInterventionType.find(({ value }) => value === currentInterventionType),
    [currentInterventionType, optionsInterventionType],
  );

  const {
    businessUnitIds: businessUnitIdsStorage,
    supplierIds: supplierIdsStorage,
    adminRegionIds: adminRegionIdsStorage,
    materialIds: materialIdsStorage,
    endYear,
  } = newInterventionData;

  const createIntervention = useCreateNewIntervention();
  const updateIntervention = useUpdateIntervention();

  const hasErrors = Object.keys(errors).length > 0;

  const handleContinue = useCallback(
    (values) => {
      if (!hasErrors) {
        dispatch(setNewInterventionData(values));
        dispatch(setNewInterventionStep(2));

        // sendind data to API if intervention type is 'Change production efficiency',
        // API need values from step 1 to precalculate Landgriffon estimated values in step 2
        if (type === 'Change production efficiency') {
          const parsedData = {
            scenarioId: currentScenario,
            title: values.title || newInterventionData.title,
            interventionDescription:
              values.interventionDescription || newInterventionData.interventionDescription,
            percentage: Number(values.percentage) || Number(newInterventionData.percentage),
            materialIds: values.materialIds || newInterventionData.materialIds,
            businessUnitIds: values.businessUnitIds || newInterventionData.businessUnitIds,
            startYear: Number(values.endYear) || Number(newInterventionData.endYear),
            endYear: Number(values.endYear) || Number(newInterventionData.endYear),
            type,
            // don't send field if intervention is applicable to all suppliers
            ...((values.supplierIds || newInterventionData.supplierIds) && {
              supplierIds: values.supplierIds || newInterventionData.supplierIds,
            }),
            adminRegionIds: values.adminRegionIds || newInterventionData.adminRegionIds,
          };
          if (interventionMode === 'create') {
            createIntervention.mutate(parsedData, {
              onSuccess: () => {
                console.info('Pre-calculating LG estimated values for this intervention');
              },
              onError: () => {
                toast.error('There has been a problem, try again');
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
                  console.info('Pre-calculating LG estimated values for this intervention');
                },
                onError: () => {
                  toast.error('There has been a problem, try again');
                },
              },
            );
          }
        }
      }
    },
    [
      dispatch,
      hasErrors,
      currentIntervention,
      currentScenario,
      newInterventionData,
      type,
      createIntervention,
      interventionMode,
      updateIntervention,
    ],
  );

  // To - Do - get rid of this use effect. Currently being used to preserve previous data
  // when going back and fordward through steps
  useEffect(() => {
    if (
      !!businessUnitIdsStorage &&
      !!supplierIdsStorage &&
      !!businessUnitIdsStorage &&
      !!adminRegionIdsStorage &&
      !!materialIdsStorage &&
      !!endYear
    ) {
      const emptySchema = yup.object({
        interventionDescription: yup.string(),
        percentage: yup.number().min(0).max(100),
        materialIds: yup.array().min(1),
        businessUnitIds: yup.array().min(1),
        supplierIds: yup.array().nullable(),
        adminRegionIds: yup.array().min(1),
        endYear: yup
          .number()
          .test(
            'len',
            'Must be a valid year',
            (val) => Math.ceil(Math.log(val + 1) / Math.LN10) === 4,
          )
          .required('error'), // year completion
        type: yup.string(),
      });
      setResolver(emptySchema);
      clearErrors();
    }
  }, [
    clearErrors,
    materialIdsStorage,
    businessUnitIdsStorage,
    supplierIdsStorage,
    adminRegionIdsStorage,
    endYear,
  ]);

  const handleDropdown = useCallback(
    (id: string, values: SelectOption | SelectOption[]) => {
      const valuesIds = Array.isArray(values)
        ? values.map((option) => option?.value)
        : [values?.value];

      setValue(id, valuesIds);
      clearErrors(id);
    },
    [setValue, clearErrors],
  );

  const handleInterventionType = useCallback(
    (id: string, value: SelectOption) => {
      dispatch(
        setNewInterventionData({ type: value.value } as Partial<
          ScenariosState['newInterventionData']
        >),
      );
      setValue(id, value.value);
      clearErrors(id);
    },
    [setValue, clearErrors, dispatch],
  );

  const handleCancel = useCallback(() => {
    reset();
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
    dispatch(resetInterventionData());
  }, [dispatch, reset]);

  const handleReset = useCallback(() => {
    resetField('businessUnitIds');
    resetField('supplierIds');
    resetField('adminRegionIds');
    resetField('materialIds');
    dispatch(setNewInterventionData(initialState.newInterventionData));
  }, [resetField, dispatch]);

  return (
    <form onSubmit={handleSubmit(handleContinue)}>
      <fieldset className="sm:col-span-3 text-sm">
        <div className="mt-6">
          <Label htmlFor="intervention_description">
            Intervention description <span className="text-gray-600">(optional)</span>
          </Label>
          <div className="mt-3">
            <Textarea
              {...register('interventionDescription')}
              id="intervention_description"
              name="intervention_description"
              rows={3}
              className="w-full"
              defaultValue=""
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-4 flex flex-col">
        <div className="flex justify-between py-3">
          <p className="font-medium leading-5 text-sm">Apply intervention to:</p>
          <button type="button" onClick={handleReset} className="text-sm text-green-700">
            Clear all
          </button>
        </div>
        <div className="flex flex-wrap items-center text-green-700 space-x-2">
          <Input
            {...register('percentage')}
            type="number"
            name="percentage"
            id="percentage"
            min={0}
            max={100}
            aria-label="percentage"
            placeholder="100"
            defaultValue={100}
            theme="inline-primary"
            unit="%"
            className="whitespace-nowrap min-w-fit mb-1"
            error={errors?.endYear?.message}
            showHint={false}
          />

          <span className="text-gray-700">of</span>
          <div className="mt-1">
            <Materials
              {...register('materialIds')}
              multiple={false}
              businessUnitIds={businessUnitIds}
              supplierIds={supplierIds}
              originIds={adminRegionIds}
              withSourcingLocations
              current={watch('materialIds') || newInterventionData.materialIds}
              onChange={(values) => handleDropdown('materialIds', values)}
              ellipsis={false}
              theme="inline-primary"
              error={!!errors?.materialIds?.message}
            />
          </div>
          <span className="text-gray-700">for</span>
          <div className="mt-1">
            <BusinessUnits
              {...register('businessUnitIds')}
              multiple
              materialIds={materialIds}
              supplierIds={supplierIds}
              originIds={adminRegionIds}
              withSourcingLocations
              current={watch('businessUnitIds') || newInterventionData.businessUnitIds}
              onChange={(values) => handleDropdown('businessUnitIds', values)}
              ellipsis
              theme="inline-primary"
              error={!!errors?.businessUnitIds?.message}
            />
          </div>
          <span className="text-gray-700 font-medium">from</span>
          <div className="mt-1">
            <Suppliers
              {...register('supplierIds')}
              multiple
              materialIds={materialIds}
              businessUnitIds={businessUnitIds}
              originIds={adminRegionIds}
              withSourcingLocations
              current={watch('supplierIds') || newInterventionData.supplierIds}
              onChange={(values) => handleDropdown('supplierIds', values)}
              theme="inline-primary"
              error={!!errors?.supplierIds?.message}
            />
          </div>
          <span className="text-gray-700 font-medium">in</span>
          <div className="mt-1">
            <OriginRegions
              {...register('adminRegionIds')}
              multiple
              materialIds={materialIds}
              supplierIds={supplierIds}
              businessUnitIds={businessUnitIds}
              withSourcingLocations
              current={watch('adminRegionIds') || newInterventionData.adminRegionIds}
              onChange={(values) => handleDropdown('adminRegionIds', values)}
              theme="inline-primary"
              error={!!errors?.adminRegionIds?.message}
            />
          </div>
          <span className="text-gray-700 font-medium">.</span>
        </div>
      </fieldset>
      <div className="my-9 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
        <div className="text-sm font-medium text-gray-700">
          <span>
            Year of completion
            <sup>*</sup>
          </span>
          <div className="mt-1">
            <Input
              {...register('endYear')}
              autoFocus={false}
              type="number"
              name="endYear"
              id="endYear"
              defaultValue={newInterventionData.endYear}
              placeholder="Insert year"
              aria-label="year"
              error={errors?.endYear?.message && 'Must be a valid year'}
            />
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700">
          <span>
            Type of intervention
            <sup>*</sup>
          </span>
          <div className="mt-1">
            <Select
              {...register('type')}
              current={selectedInterventionOption}
              options={optionsInterventionType}
              onChange={(value) => handleInterventionType('type', value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {hasErrors && (
          <div className="mt-2 text-sm text-red-600">
            <p className="first-letter:uppercase">{errorMessage}</p>
          </div>
        )}
        <div className="flex justify-end flex-1">
          <Button type="button" onClick={handleCancel} theme="secondary">
            Cancel
          </Button>
          <Button type="submit" className="ml-3">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Step1;
