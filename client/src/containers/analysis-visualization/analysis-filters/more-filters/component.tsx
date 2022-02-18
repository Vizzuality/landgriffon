import React, { Fragment, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useOutsideClick } from 'rooks';
import { Popover, Transition } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilters } from 'store/features/analysis';
import type { AnalysisState } from 'store/features/analysis';
import Button from 'components/button';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';
import Suppliers from '../suppliers/component';

const INITIAL_FILTERS: Partial<AnalysisState['filters']> = {
  materials: [],
  origins: [],
  suppliers: [],
};

const MoreFilters: React.FC = () => {
  const filtersWrapperRef = useRef();

  const { filters } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const { materials, origins, suppliers } = filters;
  const selectedFilters = useMemo(
    () => ({ materials, origins, suppliers }),
    [materials, origins, suppliers],
  );

  const [open, setOpen] = useState(false);
  const [moreFilters, setMoreFilters] = useState(selectedFilters);
  const [counter, setCounter] = useState(0);

  const handleApply = useCallback(() => {
    dispatch(
      setFilters({
        materials: moreFilters.materials || INITIAL_FILTERS.materials,
        origins: moreFilters.origins || INITIAL_FILTERS.origins,
        suppliers: moreFilters.suppliers || INITIAL_FILTERS.suppliers,
      } as AnalysisState['filters']),
    );
    setOpen(false);
  }, [dispatch, moreFilters]);

  const handleClearFilters = useCallback(() => {
    setMoreFilters(INITIAL_FILTERS as AnalysisState['filters']); // reset filters
  }, []);

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

  useEffect(() => {
    const counters = Object.keys(selectedFilters).map((key) => selectedFilters[key].length);
    const total = counters.reduce((a, b) => a + b);
    setCounter(total);
  }, [selectedFilters]);

  useOutsideClick(filtersWrapperRef, () => {
    setOpen(false);
  });

  return (
    <Popover className="relative">
      <Button theme="secondary" onClick={() => setOpen(!open)}>
        <span className="block h-5 truncate">
          <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
        </span>
        {counter !== 0 && (
          <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
            {counter}
          </span>
        )}
      </Button>

      <Transition
        show={open}
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Popover.Panel static className="absolute right-0 mt-1 w-80 z-20">
          <div
            ref={filtersWrapperRef}
            className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
          >
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
                    current={filters.materials}
                    onChange={(values) => handleChangeFilter('materials', values)}
                  />
                </div>
                <div>
                  <div className="mb-1">Origins</div>
                  <OriginRegions
                    multiple
                    current={filters.origins}
                    onChange={(values) => handleChangeFilter('origins', values)}
                  />
                </div>
                <div>
                  <div className="mb-1">Suppliers</div>
                  <Suppliers
                    multiple
                    current={filters.suppliers}
                    onChange={(values) => handleChangeFilter('suppliers', values)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button theme="secondary" className="px-8" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button theme="primary" className="flex-grow" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default MoreFilters;
