import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
import { Popover, Transition } from '@headlessui/react';
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
import { flattenTree, recursiveMap, recursiveSort } from 'components/tree-select/utils';

import type { TreeSelectOption } from 'components/tree-select/types';
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
  select: (data: ApiTreeResponse[]) => {
    const sorted = recursiveSort(data, 'name');
    return sorted.map((item) => recursiveMap(item, ({ id, name }) => ({ label: name, value: id })));
  },
};

const MoreFilters = () => {
  const { query } = useRouter();
  const { scenarioId, compareScenarioId } = query;

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

  // Only the changes are applied when the user clicks on Apply
  const handleApply = useCallback(() => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch, selectedFilters]);

  // Close filters window
  const handleCancel = useCallback(() => {
    setSelectedFilters(moreFilters);
  }, [moreFilters]);

  // Restoring state from initial state only internally,
  // the user have to apply the changes
  const handleClearFilters = useCallback(() => {
    setSelectedFilters(INITIAL_FILTERS);
  }, []);

  // Updating internal state from selectors
  const handleChangeFilter = useCallback(
    (key: keyof MoreFiltersState, values: TreeSelectOption[]) => {
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
    // open: isOpen,
    // onOpenChange: handleOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const scenarioIds = useMemo(
    () => [scenarioId, compareScenarioId].filter((id) => id) as string[],
    [scenarioId, compareScenarioId],
  );

  const { data: materialOptions } = useMaterialsTrees(
    {
      depth: 1,
      withSourcingLocations: true,
      scenarioIds,
      originIds,
      supplierIds,
      locationTypes: locationTypesIds,
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: originOptions } = useAdminRegionsTrees(
    {
      withSourcingLocations: true,
      materialIds,
      supplierIds,
      locationTypes: locationTypesIds,
      scenarioIds,
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: supplierOptions } = useSuppliersTrees(
    {
      withSourcingLocations: true,
      materialIds,
      originIds,
      locationTypes: locationTypesIds,
      scenarioIds,
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: locationTypeOptions } = useLocationTypes(
    {
      materialIds,
      originIds,
      supplierIds,
      scenarioIds,
    },
    {
      ...DEFAULT_QUERY_OPTIONS,
      select: undefined,
    },
  );

  const reviewFilterContent = useCallback(
    (
      name: keyof MoreFiltersState,
      currentValues: TreeSelectOption[],
      allOptions: TreeSelectOption[],
    ) => {
      const allNodes = allOptions.flatMap((opt) => flattenTree(opt));
      const allKeys = allNodes.map(({ value }) => value);
      const currentNodes = currentValues.flatMap(flattenTree);
      const validOptions = currentNodes.filter(({ value }) => allKeys.includes(value));

      if (validOptions.length !== allKeys.length) {
        dispatch(setFilter({ id: name, value: validOptions }));
      }
    },
    [dispatch],
  );

  // Check current values are valid if the scenario changes
  const handleScenarioChange = useCallback(() => {
    reviewFilterContent('materials', materials, materialOptions);
    reviewFilterContent('locationTypes', locationTypes, locationTypes);
    reviewFilterContent('origins', origins, origins);
    reviewFilterContent('suppliers', suppliers, suppliers);
  }, [locationTypes, materialOptions, materials, origins, reviewFilterContent, suppliers]);

  useEffect(() => {
    handleScenarioChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className="flex items-center space-x-2 px-2 py-2.5 border border-gray-200 rounded-md bg-white shadow-sm hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0"
            type="button"
            {...getReferenceProps({
              ref: reference,
            })}
            data-testid="more-filters-button"
          >
            <FilterIcon className="block w-5 h-5 mx-1 text-gray-900" aria-hidden="true" />
            {counter > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white rounded-full bg-navy-400">
                {counter}
              </span>
            )}
          </Popover.Button>
          <FloatingPortal>
            <Transition
              as="div"
              className="z-10"
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
              {...getFloatingProps({
                ref: floating,
                style: {
                  position: strategy,
                  top: y ?? '',
                  left: x ?? '',
                },
              })}
            >
              <Popover.Panel
                static
                className="p-4 mt-1 bg-white rounded-md shadow-md w-80 ring-1 ring-gray-200"
              >
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
                      id="materials-filter"
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
                      id="origins-filter"
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
                      id="suppliers-filter"
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
                  <Button
                    variant="secondary"
                    className="px-9"
                    onClick={() => {
                      close();
                      handleCancel();
                    }}
                  >
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
              </Popover.Panel>
            </Transition>
          </FloatingPortal>
        </>
      )}
    </Popover>
  );
};

export default MoreFilters;
