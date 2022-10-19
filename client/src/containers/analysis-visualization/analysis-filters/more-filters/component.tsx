import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { FilterIcon } from '@heroicons/react/solid';
import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react-dom-interactions';
import { Transition } from '@headlessui/react';
import sortBy from 'lodash/sortBy';
import { useRouter } from 'next/router';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';
import Suppliers from '../suppliers/component';
import LocationTypes from '../location-types/component';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import { setFilter } from 'store/features/analysis';
import { useMaterialsTrees } from 'hooks/materials';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import { useSuppliersTrees } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/location-types';
import Button from 'components/button/component';

import type { SelectOption } from 'components/select';
import type { AnalysisFiltersState } from 'store/features/analysis/filters';

type MoreFiltersState = {
  materials: AnalysisFiltersState['materials'];
  origins: AnalysisFiltersState['origins'];
  suppliers: AnalysisFiltersState['suppliers'];
  locationTypes: AnalysisFiltersState['locationTypes'];
};

const INITIAL_FILTERS: MoreFiltersState = {
  materials: [],
  origins: [],
  suppliers: [],
  locationTypes: [],
};

interface ApiTreeResponse {
  id: string;
  name: string;
  children?: this[];
}

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  select: (data: ApiTreeResponse[]) =>
    sortBy(
      data?.map(({ name, id, children }) => ({
        label: name,
        value: id,
        children: children?.map(({ name, id }) => ({ label: name, value: id })),
      })),
      'label',
    ),
};

const MoreFilters = () => {
  const { query } = useRouter();
  const scenarioId = query.scenarioId as string;
  const compareScenarioId = query.compareScenarioId as string;
  const dispatch = useAppDispatch();
  const { materials, origins, suppliers, locationTypes } = useAppSelector(analysisFilters);

  const moreFilters: MoreFiltersState = useMemo(
    () => ({ materials, origins, suppliers, locationTypes }),
    [materials, origins, suppliers, locationTypes],
  );

  // Initial state from redux
  const [selectedFilters, setSelectedFilters] = useState(moreFilters);

  const materialIds = useMemo(
    () => selectedFilters.materials.map(({ value }) => value),
    [selectedFilters.materials],
  );

  const originIds = useMemo(
    () => selectedFilters.origins.map(({ value }) => value),
    [selectedFilters.origins],
  );

  const supplierIds = useMemo(
    () => selectedFilters.suppliers.map(({ value }) => value),
    [selectedFilters.suppliers],
  );

  const locationTypesIds = useMemo(
    () => selectedFilters.locationTypes.map(({ value }) => value),
    [selectedFilters.locationTypes],
  );

  const [counter, setCounter] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // Restoring state from initial state from redux
  useEffect(() => {
    if (isOpen) return;
    setSelectedFilters(moreFilters);
  }, [isOpen, moreFilters]);

  // Only the changes are applied when the user clicks on Apply
  const handleApply = useCallback(() => {
    dispatch(setFilters(selectedFilters));
    setIsOpen(false);
  }, [dispatch, selectedFilters]);

  // Close filters window
  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Restoring state from initial state only internally,
  // the user have to apply the changes
  const handleClearFilters = useCallback(() => {
    setSelectedFilters(INITIAL_FILTERS);
  }, []);

  // Updating internal state from selectors
  const handleChangeFilter = useCallback(
    (key: keyof MoreFiltersState, values: SelectOption<string | number>[]) => {
      setSelectedFilters((filters) => ({ ...filters, [key]: values }));
    },
    [],
  );

  useEffect(() => {
    const counters = Object.values(moreFilters).map((value) => value.length);
    const total = counters.reduce((a, b) => a + b);
    setCounter(total);
  }, [moreFilters]);

  // Check difference between current selection of filters and filters already applied
  const hasChangesToApply = useMemo(
    () => JSON.stringify(selectedFilters) !== JSON.stringify(moreFilters),
    [selectedFilters, moreFilters],
  );

  const { reference, floating, strategy, x, y, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const { data: materialOptions } = useMaterialsTrees(
    {
      depth: 1,
      withSourcingLocations: true,
      scenarioIds: [scenarioId, ...(compareScenarioId ? [compareScenarioId] : [])],
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: originOptions } = useAdminRegionsTrees(
    {
      withSourcingLocations: true,
      materialIds,
      supplierIds,
      locationTypes: locationTypesIds,
      scenarioIds: [scenarioId, ...(compareScenarioId ? [compareScenarioId] : [])],
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: supplierOptions } = useSuppliersTrees(
    {
      withSourcingLocations: true,
      materialIds,
      originIds,
      locationTypes: locationTypesIds,
      scenarioIds: [scenarioId, ...(compareScenarioId ? [compareScenarioId] : [])],
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: locationTypeOptions } = useLocationTypes(
    {
      materialIds,
      originIds,
      supplierIds,
      scenarioIds: [scenarioId, ...(compareScenarioId ? [compareScenarioId] : [])],
    },
    {
      ...DEFAULT_QUERY_OPTIONS,
      select: undefined,
    },
  );

  const allData: Partial<Record<keyof MoreFiltersState, SelectOption[]>> = useMemo(() => {
    return {
      materials: materialOptions,
      origins: originOptions,
      suppliers: supplierOptions,
      locationTypes: locationTypeOptions,
    };
  }, [locationTypeOptions, materialOptions, originOptions, supplierOptions]);

  const reviewFilterContent = useCallback(
    (name: keyof MoreFiltersState) => {
      const currentValues = selectedFilters[name];
      const allOptions = allData[name];
      const validOptions = currentValues.filter(({ value }) =>
        allOptions.some((option) => option.value === value),
      );

      if (validOptions.length !== currentValues.length) {
        dispatch(setFilter({ id: name, value: validOptions }));
      }
    },
    [allData, dispatch, selectedFilters],
  );

  useEffect(() => {
    Object.keys(selectedFilters).forEach(reviewFilterContent);
  }, [reviewFilterContent, scenarioId, selectedFilters]);

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-2 py-2.5 border border-gray-200 rounded-md bg-white shadow-sm hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0"
        type="button"
        {...getReferenceProps({
          ref: reference,
        })}
      >
        <FilterIcon className="block w-5 h-5 mx-1 text-gray-900" aria-hidden="true" />
        {counter > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white rounded-full bg-navy-400">
            {counter}
          </span>
        )}
      </button>
      <FloatingPortal>
        <Transition
          as="div"
          show={isOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
          className="z-10"
          {...getFloatingProps({
            ref: floating,
            style: {
              position: strategy,
              top: y ?? '',
              left: x ?? '',
              zIndex: 100,
            },
          })}
        >
          <div className="p-4 mt-1 bg-white rounded-md shadow-md w-80 ring-1 ring-gray-200">
            <div className="flex justify-between mb-4">
              <div>Filter by</div>
              <button type="button" className="text-navy-400" onClick={handleClearFilters}>
                Clear all
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1">Material</div>
                <Materials
                  options={materialOptions}
                  multiple
                  current={selectedFilters.materials}
                  fitContent
                  onChange={(values) => handleChangeFilter('materials', values)}
                />
              </div>
              <div>
                <div className="mb-1">Origins</div>
                <OriginRegions
                  options={originOptions}
                  multiple
                  current={selectedFilters.origins}
                  fitContent
                  onChange={(values) => handleChangeFilter('origins', values)}
                />
              </div>
              <div>
                <div className="mb-1">Suppliers</div>
                <Suppliers
                  multiple
                  options={supplierOptions}
                  current={selectedFilters.suppliers}
                  fitContent
                  onChange={(values) => handleChangeFilter('suppliers', values)}
                />
              </div>
              <div>
                <div className="mb-1">Location type</div>
                <LocationTypes
                  options={locationTypeOptions}
                  current={selectedFilters.locationTypes}
                  fitContent
                  onChange={(values) => handleChangeFilter('locationTypes', values)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="secondary" className="px-9" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-grow"
                onClick={handleApply}
                disabled={!hasChangesToApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </Transition>
      </FloatingPortal>
    </div>
  );
};

export default MoreFilters;
