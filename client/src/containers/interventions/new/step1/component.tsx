import { useCallback, useMemo, FC } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { isEmpty } from 'lodash';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useInterventionTypes } from 'hooks/analysis';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import {
  scenarios,
  setNewInterventionStep,
  setNewInterventionData,
  resetInterventionData,
  ScenariosState,
} from 'store/features/analysis/scenarios';

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

// types
import type { SelectOption, SelectOptions } from 'components/select/types';
import { initialState } from 'store/features/analysis/scenarios';
const schemaValidation = yup.object({
  interventionDescription: yup.string(),
  percentage: yup.number().min(0).max(100).required(),
  materialIds: yup.array().min(1).required(),
  businessUnitIds: yup.array().min(1).required(),
  supplierIds: yup.array().min(1).required(),
  adminRegionIds: yup.array().min(1).required(),
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

  const optionsInterventionType: SelectOptions = useMemo(
    () =>
      interventionTypes.map(({ title, value }) => ({
        label: title,
        value: value,
      })),
    [interventionTypes],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    resetField,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: optionsInterventionType[0].value,
    } as FieldValues,
    resolver: yupResolver(schemaValidation),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const formValues = getValues();

  const { businessUnitIds, supplierIds, originIds, materialIds } = formValues;

  const currentInterventionType = watch('type');
  const selectedInterventionOption = useMemo(
    () => optionsInterventionType.find(({ value }) => value === currentInterventionType),
    [currentInterventionType, optionsInterventionType],
  );

  const handleContinue = useCallback(
    (values) => {
      if (isEmpty(errors)) {
        dispatch(setNewInterventionData(values));
        dispatch(setNewInterventionStep(2));
      }
    },
    [dispatch, errors],
  );

  const handleDropdown = useCallback(
    (id: string, values: SelectOption | SelectOption[]) => {
      const valuesIds = Array.isArray(values)
        ? values.map((option) => option?.value)
        : values?.value;

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
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
    dispatch(resetInterventionData());
  }, [dispatch]);

  const handleReset = useCallback(() => {
    resetField('businessUnitIds');
    resetField('supplierIds');
    resetField('originIds');
    resetField('materialIds');
    dispatch(setNewInterventionData(initialState.newInterventionData));
  }, [resetField, dispatch]);

  const { newInterventionData } = useAppSelector(scenarios);

  const currentMaterials = useMemo(() => {
    return newInterventionData.materialIds || watch('materialIds');
  }, [newInterventionData.materialIds, watch]);

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
        <div className="flex items-center text-green-700 space-x-1">
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
            className="whitespace-nowrap"
            error={errors?.endYear?.message}
            showHint={false}
          />

          <span className="text-gray-700">of</span>
          <div className="font-bold">
            <Materials
              {...register('materialIds')}
              multiple
              withSourcingLocations
              businessUnitIds={businessUnitIds}
              supplierIds={supplierIds}
              originIds={originIds}
              current={watch('materialIds') || newInterventionData.materialIds}
              onChange={(values) => handleDropdown('materialIds', values)}
              ellipsis
              theme="inline-primary"
              error={!!errors?.materialIds?.message}
            />
          </div>
          <span className="text-gray-700">for</span>
          <BusinessUnits
            {...register('businessUnitIds')}
            multiple
            withSourcingLocations
            materialIds={materialIds}
            supplierIds={supplierIds}
            originIds={originIds}
            current={watch('businessUnitIds') || newInterventionData.businessUnitIds}
            onChange={(values) => handleDropdown('businessUnitIds', values)}
            ellipsis
            theme="inline-primary"
            error={!!errors?.businessUnitIds?.message}
          />
          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            {...register('supplierIds')}
            multiple
            withSourcingLocations
            materialIds={materialIds}
            businessUnitIds={businessUnitIds}
            originIds={originIds}
            current={watch('supplierIds') || newInterventionData.supplierIds}
            onChange={(values) => handleDropdown('supplierIds', values)}
            theme="inline-primary"
            error={!!errors?.supplierIds?.message}
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            {...register('adminRegionIds')}
            multiple
            withSourcingLocations
            materialIds={materialIds}
            supplierIds={supplierIds}
            businessUnitIds={businessUnitIds}
            current={watch('adminRegionIds') || newInterventionData.adminRegionIds}
            onChange={(values) => handleDropdown('adminRegionIds', values)}
            theme="inline-primary"
            error={!!errors?.adminRegionIds?.message}
          />
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
              type="number"
              name="endYear"
              id="endYear"
              defaultValue=""
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
        {!isEmpty(errors) && (
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
