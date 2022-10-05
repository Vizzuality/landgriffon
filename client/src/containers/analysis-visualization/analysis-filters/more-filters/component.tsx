import React, { useCallback, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';
import { FilterIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import Button, { THEME } from 'components/button/component';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';
import Suppliers from '../suppliers/component';
import LocationTypes from '../location-types/component';

import type { AnalysisFiltersState } from 'store/features/analysis/filters';
import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react-dom-interactions';
import { Transition } from '@headlessui/react';
import { scenarios } from 'store/features/analysis';

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

  const locationTypesValues = useMemo(
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
  const handleChangeFilter = useCallback((key, values) => {
    setSelectedFilters((filters) => ({ ...filters, [key]: values }));
  }, []);

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
          <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-green-700 rounded-full">
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
              <Button theme="textLight" size="text" onClick={handleClearFilters}>
                Clear all
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1">Material</div>
                <Materials
                  multiple
                  withSourcingLocations
                  originIds={originIds}
                  supplierIds={supplierIds}
                  locationTypes={locationTypesValues}
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
                  locationTypes={locationTypesValues}
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
                  locationTypes={locationTypesValues}
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
              <Button theme="secondary" className="px-9" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                theme="primary"
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
