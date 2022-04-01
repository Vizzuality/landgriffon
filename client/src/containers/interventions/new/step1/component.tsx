import { useCallback, useMemo, FC } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useBusinessUnits } from 'hooks/business-units';
import { setSubContentCollapsed } from 'store/features/analysis/ui';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import Select from 'components/select';
import Button from 'components/button';
import Hint from 'components/forms/hint';

import Materials from 'containers/interventions/smart-filters/materials/component';
import Suppliers from 'containers/interventions/smart-filters/suppliers/component';
import OriginRegions from 'containers/interventions/smart-filters/origin-regions/component';

// hooks
import { setNewInterventionStep, setNewInterventionData } from 'store/features/analysis/scenarios';

// form validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { isArray, isEmpty } from 'lodash';

// types
import type { SelectOptions } from 'components/select/types';

//import type { AnalysisState } from 'store/features/analysis';
import { useInterventionTypes } from 'hooks/analysis';

const schemaValidation = yup.object({
  interventionDescription: yup.string(),
  percentage: yup.number().min(0).max(100).required(),
  materialsIds: yup.array().min(1).required(),
  businessUnitsIds: yup.string().required(),
  suppliersIds: yup.array().min(1).required(),
  adminRegionsIds: yup.array().min(1).required(),
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
      interventionTypes.map(({ title, slug }) => ({
        label: title,
        value: slug,
      })),
    [],
  );

  const { data: businesses, isLoading: isLoadingBusinesses } = useBusinessUnits();

  const optionsBusinesses: SelectOptions = useMemo(
    () =>
      businesses.map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    [businesses],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

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
    (id, values) => {
      const valuesIds = isArray(values) ? values.map(({ value }) => value) : values;
      setValue(id, valuesIds);
      clearErrors(id);
    },
    [setValue, clearErrors],
  );

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(2));
  }, [dispatch]);

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
        <p className="font-medium leading-5 text-sm">Apply intervention to:</p>
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
            error={!!errors?.endYear?.message}
          />

          <span className="text-gray-700">of</span>
          <div className="font-bold">
            <Materials
              {...register('materialsIds')}
              multiple
              withSourcingLocations
              current={watch('materials')}
              onChange={(values) => handleDropdown('materialsIds', values)}
              ellipsis
              theme="inline-primary"
              error={!!errors?.materialsIds?.message}
            />
          </div>
          <span className="text-gray-700">for</span>
          <Select
            {...register('businessUnitsIds')}
            loading={isLoadingBusinesses}
            current={watch('businessUnitsIds')}
            options={optionsBusinesses}
            placeholder="all businesses"
            theme="inline-primary"
            onChange={({ value }) => handleDropdown('businessUnitsIds', value)}
            error={!!errors?.businessUnitsIds?.message}
          />
          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            {...register('suppliersIds')}
            multiple
            withSourcingLocations
            current={watch('suppliers')}
            onChange={(values) => handleDropdown('suppliersIds', values)}
            theme="inline-primary"
            error={!!errors?.suppliersIds?.message}
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            {...register('adminRegionsIds')}
            multiple
            withSourcingLocations
            current={watch('originRegions')}
            onChange={(values) => handleDropdown('adminRegionsIds', values)}
            theme="inline-primary"
            error={!!errors?.adminRegionsIds?.message}
          />
          <span className="text-gray-700 font-medium">.</span>
        </div>
      </fieldset>
      <div className="mt-9 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
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
              error={!!errors?.endYear?.message}
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
              current={watch('type')}
              options={optionsInterventionType}
              placeholder="Select"
              onChange={({ value }) => handleDropdown('type', value)}
            />
          </div>
        </div>
      </div>
      <div className="pt-10 flex justify-between items-center">
        {!isEmpty(errors) && <Hint error={true}>{errorMessage}</Hint>}
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
