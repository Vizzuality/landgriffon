import { useCallback, useMemo, FC } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';

import { setFilter, analysisFilters } from 'store/features/analysis/filters';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import Select from 'components/select';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import Suppliers from 'containers/analysis-visualization/analysis-filters/suppliers/component';
import OriginRegions from 'containers/analysis-visualization/analysis-filters/origin-regions/component';

// types
import { SelectOptions, SelectOption } from 'components/select/types';
//import type { AnalysisState } from 'store/features/analysis';
import { useInterventionTypes } from 'hooks/analysis';

const businesses = ['business1', 'business2', 'business3'];
const yearCompletions = [2001, 2015, 2020];

const Step1: FC = () => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const filters = useAppSelector(analysisFilters);
  const interventionTypes = useInterventionTypes();

  // const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  // const { data: businesses, isLoading: isLoadingBusinesses } = useBusinesses();
  // const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers();
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

  const handleChange = useCallback(
    (id, e) => {
      dispatch(setFilter({ id, value: e.value }));
    },
    [dispatch],
  );

  // const handleChangeFilter = useCallback(
  //   // only save ids on store
  //   (key, values) => {
  //     setMoreFilters({
  //       ...moreFilters,
  //       [key]: values,
  //     } as AnalysisState['filters']);
  //   },
  //   [moreFilters],
  // );

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

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
        <div className="mt-6">
          <Label htmlFor="intervention_description">
            Intervention description <span className="text-gray-600">(optional)</span>
          </Label>
          <div className="mt-1">
            <Textarea
              id="intervention_description"
              name="intervention_description"
              rows={3}
              className="w-full"
              defaultValue=""
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-1 flex flex-col">
        <p className="font-medium leading-5 text-sm">Apply intervention to:</p>
        <div className="flex items-center text-green-700 space-x-2">
          <Input
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
              multiple
              withSourcingLocations
              current={filters.materials}
              onChange={(values) => handleChange('materials', values)}
              theme="inline-primary"
              ellipsis
            />
          </div>
          <span className="text-gray-700 font-medium">for</span>
          <Select
            loading={isLoadingBusinesses}
            current={currentBusiness}
            options={optionsBusinesses}
            placeholder="all businesses"
            // onChange={() => onChange('businesses', currentBusiness.value)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            multiple
            withSourcingLocations
            current={filters.suppliers}
            onChange={({ values }) => handleChange('suppliers', values)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            multiple
            withSourcingLocations
            current={filters.suppliers}
            onChange={({ values }) => handleChange('origin', values)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">.</span>
        </div>
      </fieldset>
      <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
        <div className="text-sm font-medium text-gray-700">
          <span>Year of completion</span>
          <div className="mt-1">
            <Select
              loading={isLoadingYearCompletion}
              current={currentYearCompletion}
              options={optionsYearCompletion}
              placeholder="Select"
              // onChange={() => onChange('year_completion', currentYearCompletion.value)}
            />
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700">
          <span>Type of intervention</span>
          <div className="mt-1">
            <Select
              loading={isLoadingInterventionTypes}
              current={currentInterventionType}
              options={optionsInterventionType}
              placeholder="Select"
              onChange={handleInterventionType}
              // onChange={({ value }) => dispatch(setFilter({ id: 'interventionType', value: value }))}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1;
