import { useCallback, useMemo, useState, FC } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';

import { analysis, setFilter } from 'store/features/analysis';

// components
import Input from 'components/forms/input';
import Select from 'components/select';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import Suppliers from 'containers/analysis-visualization/analysis-filters/suppliers/component';
import OriginRegions from 'containers/analysis-visualization/analysis-filters/origin-regions/component';

// types
import { SelectOptions, SelectOption } from 'components/select/types';
import type { AnalysisState } from 'store/features/analysis';
import { useInterventionTypes } from 'hooks/analysis';

const businesses = ['business1', 'business2', 'business3'];
const yearCompletions = [2001, 2015, 2020];

const Step1: FC = () => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const { filters } = useAppSelector(analysis);
  const interventionTypes = useInterventionTypes();

  // const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  // const { data: businesses, isLoading: isLoadingBusinesses } = useBusinesses();
  // const { data: supliers, isLoading: isLoadingSupliers } = useSupliers();
  // const { data: sourcingRegions, isLoading: isLoadingSourcingRegions } = useSourcingRegions();

  const business = 'business2';
  const yearCompletion = 2015;
  const interventionType = '';

  const { materials, origins, suppliers } = filters;
  const selectedFilters = useMemo(
    () => ({ materials, origins, suppliers }),
    [materials, origins, suppliers],
  );

  const [moreFilters, setMoreFilters] = useState(selectedFilters);

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
    (e) => {
      dispatch(setFilter({ id: 'materials', value: e }));
    },
    [dispatch],
  );

  const handleChangeFilter = useCallback(
    // only save ids on store
    (key, values) => {
      setMoreFilters({
        ...moreFilters,
        [key]: values,
      } as AnalysisState['filters']);
    },
    [moreFilters],
  );

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
          <label
            htmlFor="intervention_description"
            className="block text-sm font-medium text-gray-700"
          >
            Intervention description <span className="text-gray-600">(optional)</span>
          </label>
          <div className="mt-1">
            <textarea
              id="ntervention_description"
              name="ntervention_description"
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
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
            className="border-none mr-1 will-change-contents text-green-700"
          />
          <span className="text-green-700 font-bold">%</span>

          <span className="text-gray-700 font-medium">of</span>
          <div className="font-bold">
            <Materials
              multiple
              withSourcingLocations
              current={filters.materials}
              // onChange={(values) => handleChangeFilter('materials', values)}
              onChange={handleChange}
              theme="primary"
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
            theme="primary"
          />
          <span className="text-gray-700 font-medium">from</span>
          <Suppliers
            multiple
            withSourcingLocations
            current={filters.suppliers}
            // onChange={(values) => handleChangeFilter('suppliers', values)}
            theme="primary"
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            multiple
            withSourcingLocations
            current={filters.suppliers}
            // onChange={(values) => handleChangeFilter('suppliers', values)}
            theme="primary"
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
              // onChange={({ value }) => dispatch(setFilter({ id: 'interventioType', value: value }))}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1;
