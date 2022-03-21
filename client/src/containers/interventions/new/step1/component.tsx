import { useCallback, useMemo, FC } from 'react';
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
import Materials from 'containers/interventions/smart-filters/materials';
import Suppliers from 'containers/interventions/smart-filters/suppliers/component';
import OriginRegions from 'containers/interventions/smart-filters/origin-regions/component';

// types
import type { SelectOptions, SelectOption } from 'components/select/types';
import type { StepProps } from 'containers/interventions/new/types';

const businesses = ['business1', 'business2', 'business3'];
const yearCompletions = [2001, 2015, 2020];

const schemaValidation = yup.object({
  interventionDescription: yup.string().min(2).required(),
  // percentage: yup.number().required(),
  // materials: yup.array().min(1).required(),
  // suppliers: yup.array().min(1).required(),
  // originRegions: yup.array().min(1).required(),
});

type schemaValidationMulti = {
  // percentage: yup.number().required(),
  // materials: yup.array().min(1).required();
  // suppliers: yup.array().min(1).required(),
  // originRegions: yup.array().min(1).required(),
};

const Step1: FC<StepProps> = ({ handleCancel }: StepProps) => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const interventionTypes = useInterventionTypes();
  const filters = useAppSelector(analysisFilters);

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
    ({ value }) =>
      dispatch(
        setFilter({
          id: 'interventionType',
          value,
        }),
      ),
    [dispatch],
  );

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  // const {
  //   field: { onChange: onChangeMaterials, onBlur, name: MaterialsName, value, ref },
  //   fieldState: { invalid, isTouched, isDirty },
  //   formState: { isValid: isValidMulti, touchedFields, dirtyFields, errors: errorsMulti }
  // } = useController({
  //   control,
  //   rules: { required: true },
  //   defaultValue: "",
  // });

  const handleContinue = useCallback(
    (values) => {
      dispatch(setNewInterventionData(values));
      if (isValid) dispatch(setNewInterventionStep(2));
    },
    [dispatch, isValid],
  );

  const handleSelect = useCallback(
    (e) => {
      const values = Array.isArray(e) ? e : [e];
      const selectIds = values.map(({ value }) => value);
      if (isValid) {
        dispatch(setNewInterventionData({ value: selectIds }));
      }
    },
    [dispatch, isValid],
  );

  const handleMaterials = useCallback(
    (selected) => {
      const selectIds = selected.map(({ value }) => value);
      if (isValid) {
        dispatch(setNewInterventionData({ materials: selectIds }));
      }
    },
    [dispatch, isValid],
  );

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

      <fieldset className="mt-1 flex flex-col">
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
              multiple
              withSourcingLocations
              current={filters.materials}
              ellipsis
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
          />

          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            {...register('suppliers')}
            multiple
            withSourcingLocations
            current={filters.suppliers}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            {...register('originRegions')}
            multiple
            withSourcingLocations
            current={filters.origins}
            theme="inline-primary"
            onChange={handleSelect}
          />
          <span className="text-gray-700 font-medium">.</span>
        </div>
      </fieldset>
      <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
        <div className="text-sm font-medium text-gray-700">
          <span>Year of completion</span>
          <div className="mt-1">
            <Select
              {...register('year')}
              loading={isLoadingYearCompletion}
              current={currentYearCompletion}
              options={optionsYearCompletion}
              placeholder="Select"
            />
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700">
          <span>Type of intervention</span>
          <div className="mt-1">
            <Select
              {...register('interventionType')}
              loading={isLoadingInterventionTypes}
              current={currentInterventionType}
              options={optionsInterventionType}
              placeholder="Select"
              onChange={handleInterventionType}
            />
          </div>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <Button type="button" onClick={handleCancel} theme="secondary">
            Cancel
          </Button>
          <Button disabled={!isValid} type="submit" className="ml-3">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Step1;
