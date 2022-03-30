import { useCallback, useMemo, FC } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useBusinessUnits } from 'hooks/business-units';
import { setFilter, analysisFilters } from 'store/features/analysis/filters';
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
import { setNewInterventionStep } from 'store/features/analysis/scenarios';

// form validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { isEmpty } from 'lodash';

// types
import type { SelectOptions, SelectOption } from 'components/select/types';

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
    .test(
      'len',
      'Must be exactly 4 digits',
      (val) => Math.ceil(Math.log(val + 1) / Math.LN10) === 4,
    )
    .required('error'), // year completion
  type: yup.string().required(),
});

const Step1: FC = () => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const interventionTypes = useInterventionTypes();
  const filters = useAppSelector(analysisFilters);

  const { interventionType } = filters;

  const optionsInterventionType: SelectOptions = useMemo(
    () =>
      interventionTypes.map(({ title, slug }) => ({
        label: title,
        value: slug,
      })),
    [],
  );

  const currentInterventionType = useMemo<SelectOption>(
    () => optionsInterventionType?.find((option) => option.value === interventionType),
    [optionsInterventionType, interventionType],
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
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const handleContinue = useCallback(
    (values) => {
      if (isEmpty(errors)) {
        dispatch(setNewInterventionStep(2));
      }
    },
    [dispatch, errors],
  );

  const handleInterventionType = useCallback(
    ({ value }) => {
      setValue('type', value);
      dispatch(
        setFilter({
          id: 'interventionType',
          value,
        }),
      );
    },
    [dispatch, setValue],
  );

  const handleDropdown = useCallback(
    (id, values) => {
      const valuesIds = values.map(({ value }) => value);
      setValue(id, valuesIds);
    },
    [setValue],
  );
console.log(errors)
  const handleYear = useDebounceCallback(
    useCallback(
      (values) => {
        setValue('startYear', values);
        setValue('endYear', values);
      },
      [],
    ),
    600,
  );

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
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
            error={errors?.percentage?.message}
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
            />
          </div>
          <span className="text-gray-700">for</span>
          <Select
            {...register('businessUnitsIds')}
            loading={isLoadingBusinesses}
            current={watch('businessUnitsIds')}
            options={optionsBusinesses}
            placeholder="all businesses"
            allowEmpty
            theme="inline-primary"
            onChange={({ value }) => setValue('businessUnitsIds', value)}
            // error={errors?.businessUnitsIds}
          />
          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            {...register('suppliersIds')}
            multiple
            withSourcingLocations
            current={watch('suppliers')}
            onChange={(values) => handleDropdown('suppliersIds', values)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            {...register('adminRegionsIds')}
            multiple
            withSourcingLocations
            current={watch('originRegions')}
            onChange={(values) => handleDropdown('adminRegionsIds', values)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">.</span>
        </div>
        {errors &&
          Object.values(errors).map(({ message, ref }) => <Hint key={ref}>{message}</Hint>)}
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
              name="yearCompletion"
              id="yearCompletion"
              defaultValue=""
              placeholder="Insert year"
              aria-label="year"
              onChange={handleYear}
              error={errors?.endYear?.message}
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
              loading={!interventionType}
              current={watch('type')}
              options={optionsInterventionType}
              placeholder="Select"
              onChange={handleInterventionType}
            />
          </div>
        </div>
      </div>
      <div className="pt-10">
        <div className="flex justify-end">
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
