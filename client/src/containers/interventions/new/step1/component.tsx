import { useCallback, useMemo, useState, FC } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setFilter, analysisFilters } from 'store/features/analysis/filters';
import { useBusinessUnits } from 'hooks/business-units';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import Select from 'components/select';

import Materials from 'containers/interventions/smart-filters/materials/component';
import Suppliers from 'containers/interventions/smart-filters/suppliers/component';
import OriginRegions from 'containers/interventions/smart-filters/origin-regions/component';

// types
import type { SelectOptions, SelectOption } from 'components/select/types';
import type { AnalysisFiltersState } from 'store/features/analysis/filters';

//import type { AnalysisState } from 'store/features/analysis';
import { useInterventionTypes } from 'hooks/analysis';

const Step1: FC = () => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const interventionTypes = useInterventionTypes();
  const filters = useAppSelector(analysisFilters);

  const { materials, origins, suppliers } = filters;
  const selectedFilters = useMemo(
    () => ({ materials, origins, suppliers }),
    [materials, origins, suppliers],
  );

  const [moreFilters, setMoreFilters] = useState(selectedFilters);

  const handleChangeFilter = useCallback(
    // only save ids on store
    (key, values) => {
      setMoreFilters({
        ...moreFilters,
        [key]: values,
      } as AnalysisFiltersState);
    },
    [moreFilters],
  );

  const interventionType = '';

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
  const { data: businesses, isLoading: isLoadingBusinesses } = useBusinessUnits();

  const optionsBusinesses: SelectOptions = useMemo(
    () =>
      businesses.map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    [businesses],
  );

  const currentBusiness = useMemo<SelectOption>(
    () => optionsBusinesses?.find((option) => option.value === 'values?.businessUnitsIds'),
    [optionsBusinesses],
  );
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
              onChange={(values) => handleChangeFilter('materials', values)}
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
            onChange={(values) => handleChangeFilter('suppliers', values)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">in</span>
          <OriginRegions
            multiple
            withSourcingLocations
            current={filters.origins}
            onChange={(values) => handleChangeFilter('origins', values)}
            theme="inline-primary"
          />
          <span className="text-gray-700 font-medium">.</span>
        </div>
      </fieldset>
      <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
        <div className="text-sm font-medium text-gray-700">
          <span>Year of completion</span>
          <div className="mt-1">
            <Input
              type="number"
              name="yearCompletion"
              id="yearCompletion"
              aria-label="year"
              placeholder="Insert year"
              defaultValue={2021}
              // onChange={handleYear}
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
