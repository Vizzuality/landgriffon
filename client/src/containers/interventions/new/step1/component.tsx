import { useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useInterventionTypes } from 'hooks/analysis';

import { setNewInterventionStep, setNewInterventionData } from 'store/features/analysis/scenarios';
import { setFilter, analysisFilters } from 'store/features/analysis/filters';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import Select from 'components/select';
import { Button } from 'components/button';

// import Materials from 'containers/analysis-visualization/analysis-filters/materials';
import Materials from 'containers/interventions/smart-filters/materials/component';
import Suppliers from 'containers/interventions/smart-filters/suppliers/component';
import OriginRegions from 'containers/interventions/smart-filters/origin-regions/component';

import { isEmpty } from 'lodash';

// types
import type { SelectOptions, SelectOption } from 'components/select/types';
import type { StepProps } from 'containers/interventions/new/types';

const businesses = ['business1', 'business2', 'business3'];
const yearCompletions = [2001, 2015, 2020];

const schemaValidation = yup.object({
  interventionDescription: yup.string(),
  percentage: yup.number().min(0).max(100).required(),
  materials: yup.array().min(1).required('error'),
  business: yup.object({ label: yup.string(), value: yup.string() }).required(),
  suppliers: yup.array().min(1).required('error'),
  originRegions: yup.array().min(1).required('error'),
  yearCompletion: yup
    .number()
    .test(
      'len',
      'Must be exactly 4 digits',
      (val) => Math.ceil(Math.log(val + 1) / Math.LN10) === 4,
    )
    .required('error'),
  interventionType: yup.object({ label: yup.string(), value: yup.string() }).required(),
});

const Step1: React.FC<StepProps> = ({ handleCancel, handleInterventionData }: StepProps) => {
  const dispatch = useAppDispatch();
  const interventionTypes = useInterventionTypes();
  const filters = useAppSelector(analysisFilters);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const { materials, origins, suppliers } = filters;
  const selectedFilters = useMemo(
    () => ({ materials, origins, suppliers }),
    [materials, origins, suppliers],
  );

  // const { data: sourcingRegions, isLoading: isLoadingSourcingRegions } = useSourcingRegions();

  const business = 'business2';
  const yearCompletion = 2015;
  const interventionType = '';

  const optionsBusinesses: SelectOptions = useMemo(
    () =>
      businesses.map((business) => ({
        label: business,
        value: business,
      })),
    [],
  );

  const currentBusiness = useMemo<SelectOption>(
    () => optionsBusinesses?.find((option) => option.value === business),
    [optionsBusinesses],
  );

  const optionsYearCompletion: SelectOptions = useMemo(
    () =>
      yearCompletions.map((YearCompletion) => ({
        label: YearCompletion.toString(),
        value: YearCompletion,
      })),
    [],
  );

  const currentYearCompletion = useMemo<SelectOption>(
    () => optionsYearCompletion?.find((option) => option.value === yearCompletion),
    [optionsYearCompletion],
  );

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
    [optionsInterventionType],
  );

  const isLoadingBusinesses = false;
  const isLoadingYearCompletion = false;
  const isLoadingInterventionTypes = false;

  const handleInterventionType = useCallback(
    ({ value }) => {
      dispatch(
        setFilter({
          id: 'interventionType',
          value,
        }),
      ),
        setValue('interventionType', value);
    },
    [dispatch],
  );

  const handleBusiness = useCallback(
    ({ value }) =>
      setFilter({
        id: 'interventionType',
        value,
      }),
    [dispatch],
  );

  const handleContinue = useCallback((values) => {
    if (isEmpty(errors)) {
      dispatch(setNewInterventionData(values));
      dispatch(setNewInterventionStep(2));
      // dispatch(handleInterventionData(values))
    }
  }, []);

  const values = getValues();
  console.log('step1', values, isValid, errors)

  return (
    <form onSubmit={handleSubmit(handleContinue)}>
      <fieldset className="sm:col-span-3 text-sm">
        <div className="mt-6">
          <Label htmlFor="intervention_description">
            Intervention description <span className="text-gray-600">(optional)</span>
          </Label>
          <div className="mt-1">
            <Textarea {...register('interventionDescription')} rows={3} className="w-full" />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-3 flex flex-col">
        <p className="font-medium leading-5 text-sm">Apply intervention to:</p>
        <div className="flex items-center text-green-700 space-x-2">
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
          />

          <span className="text-gray-700 font-medium">of</span>
          <div className="font-bold">
            <Materials
              {...register('materials')}
              withSourcingLocations
              multiple
              ellipsis
              current={watch('materials')}
              onChange={(values) => setValue('materials', values)}
            />
          </div>
          <span className="text-gray-700 font-medium">for</span>

          <Select
            {...register('business')}
            loading={isLoadingBusinesses}
            current={currentBusiness}
            options={optionsBusinesses}
            placeholder="all businesses"
            theme="inline-primary"
            onChange={(values) => setValue('business', values)}
          />

          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            {...register('suppliers')}
            multiple
            withSourcingLocations
            theme="inline-primary"
            current={watch('suppliers')}
            onChange={(values) => setValue('suppliers', values)}
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            {...register('originRegions')}
            multiple
            withSourcingLocations
            theme="inline-primary"
            current={watch('originRegions')}
            onChange={(values) => setValue('originRegions', values)}
          />
          <span className="text-gray-700 font-medium">.</span>
        </div>
      </fieldset>
      <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
        <div className="text-sm font-medium text-gray-700">
          <span>Year of completion</span>
          <div className="mt-1">
            <Input
              {...register('yearCompletion')}
              type="number"
              name="yearCompletion"
              id="yearCompletion"
              aria-label="percentage"
              placeholder="Insert year"
              defaultValue={2021}
            />
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700">
          <span>Type of intervention</span>
          <div className="mt-1">
            <Select
              {...register('interventionType')}
              loading={isLoadingInterventionTypes}
              options={optionsInterventionType}
              placeholder="Select"
              current={watch(interventionType)}
              onChange={(values) => setValue('interventionType', values)}
            />
          </div>
        </div>
      </div>
      <div className="pt-5">
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
