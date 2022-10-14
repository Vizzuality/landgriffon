import React, { useCallback, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';
import { FilterIcon } from '@heroicons/react/solid';
import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react-dom-interactions';
import { Transition } from '@headlessui/react';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';
import Suppliers from '../suppliers/component';
import LocationTypes from '../location-types/component';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import Button, { THEME } from 'components/button/component';
import { scenarios, setFilter } from 'store/features/analysis';
import { useMaterialsTrees } from 'hooks/materials';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import { useSuppliersTrees } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/location-types';

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

const MoreFilters = () => {
  const dispatch = useAppDispatch();
  const { materials, origins, suppliers, locationTypes } = useAppSelector(analysisFilters);

  const { currentScenario: scenarioId } = useAppSelector(scenarios);

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

  const { data: allMaterials } = useMaterialsTrees(
    {
      depth: 1,
      withSourcingLocations: true,
      scenarioId,
    },
    {
      // 2 minutes stale time
      staleTime: 2 * 60 * 1000,
    },
  );

  const { data: allOrigins } = useAdminRegionsTrees({
    withSourcingLocations: true,
    materialIds,
    supplierIds,
    locationTypes: locationTypesIds,
    scenarioId,
  });

  const { data: allSuppliers } = useSuppliersTrees({
    withSourcingLocations: true,
    materialIds,
    originIds,
    locationTypes: locationTypesIds,
    scenarioId,
  });

  const { data: allLocationTypes } = useLocationTypes({
    materialIds,
    originIds,
    supplierIds,
    scenarioId,
  });

  const allData: Partial<Record<keyof MoreFiltersState, ({ id: string } | { value: string })[]>> =
    useMemo(() => {
      return {
        materials: allMaterials,
        origins: allOrigins,
        suppliers: allSuppliers,
        locationTypes: allLocationTypes,
      };
    }, [allLocationTypes, allMaterials, allOrigins, allSuppliers]);

  const reviewFilterContent = useCallback(
    (name: keyof MoreFiltersState) => {
      const currentValues = selectedFilters[name];
      const allOptions = allData[name];
      const validOptions = currentValues.filter(({ value }) =>
        allOptions.some((option) =>
          'id' in option ? option.id === value : option.value === value,
        ),
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
      <div
        className={classNames(
          THEME.default,
          THEME.secondary,
          'flex gap-x-1 justify-end rounded-md min-h-[2.5rem] border border-gray-300 shadow-sm px-2 select-none bg-white',
        )}
        {...getReferenceProps({
          ref: reference,
        })}
      >
        <span className="block h-5 truncate">
          <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
        </span>
        {counter !== 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-navy-400 rounded-full">
            {counter}
          </span>
        )}
      </div>
      <Transition
        show={isOpen}
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
            zIndex: 100,
          },
        })}
      >
        <div className="rounded-lg shadow-lg w-80 ring-1 ring-black ring-opacity-5 ">
          <div className="relative p-4 bg-white rounded-lg">
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
                  multiple
                  withSourcingLocations
                  originIds={originIds}
                  supplierIds={supplierIds}
                  locationTypes={locationTypesIds}
                  scenarioId={scenarioId}
                  current={selectedFilters.materials}
                  fitContent
                  onChange={(values) => handleChangeFilter('materials', values)}
                />
              </div>
              <div>
                <div className="mb-1">Origins</div>
                <OriginRegions
                  multiple
                  withSourcingLocations
                  materialIds={materialIds}
                  supplierIds={supplierIds}
                  locationTypes={locationTypesIds}
                  scenarioId={scenarioId}
                  current={selectedFilters.origins}
                  fitContent
                  onChange={(values) => handleChangeFilter('origins', values)}
                />
              </div>
              <div>
                <div className="mb-1">Suppliers</div>
                <Suppliers
                  multiple
                  withSourcingLocations
                  materialIds={materialIds}
                  originIds={originIds}
                  locationTypes={locationTypesIds}
                  scenarioId={scenarioId}
                  current={selectedFilters.suppliers}
                  fitContent
                  onChange={(values) => handleChangeFilter('suppliers', values)}
                />
              </div>
              <div>
                <div className="mb-1">Location type</div>
                <LocationTypes
                  current={selectedFilters.locationTypes}
                  fitContent
                  materialIds={materialIds}
                  originIds={originIds}
                  supplierIds={supplierIds}
                  scenarioId={scenarioId}
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
        </div>
      </Transition>
    </div>
  );
};

export default MoreFilters;
