import React, { Fragment, useCallback, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';

import { Popover, Transition } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import Button, { THEME } from 'components/button/component';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';
import Suppliers from '../suppliers/component';

import type { AnalysisFiltersState } from 'store/features/analysis/filters';

type MoreFiltersState = {
  materials: AnalysisFiltersState['materials'];
  origins: AnalysisFiltersState['origins'];
  suppliers: AnalysisFiltersState['suppliers'];
};

const INITIAL_FILTERS: MoreFiltersState = {
  materials: [],
  origins: [],
  suppliers: [],
};

const MoreFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { materials, origins, suppliers } = useAppSelector(analysisFilters);
  const moreFilters: MoreFiltersState = useMemo(
    () => ({ materials, origins, suppliers }),
    [materials, origins, suppliers],
  );

  // Initial state from redux
  const [selectedFilters, setSelectedFilters] = useState<MoreFiltersState>(moreFilters);

  const [counter, setCounter] = useState<number>(0);

  // Restoring state from initial state from redux
  const handleClose = useCallback(() => {
    setSelectedFilters(moreFilters);
  }, [moreFilters]);

  // Only the changes are applied when the user clicks on Apply
  const handleApply = useCallback(() => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch, selectedFilters]);

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

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={classNames(THEME.default, THEME.secondary, 'flex p-2 rounded-md')}
          >
            <span className="block h-5 truncate">
              <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
            </span>
            {counter !== 0 && (
              <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
                {counter}
              </span>
            )}
          </Popover.Button>
          <Transition
            show={open}
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel
              static
              className="absolute md:right-0 lg:left-0 lg:clear-right-0 mt-1 w-80 z-20"
            >
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ">
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
                        current={selectedFilters.suppliers}
                        fitContent
                        onChange={(values) => handleChangeFilter('suppliers', values)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      theme="secondary"
                      className="px-9"
                      onClick={() => {
                        handleClose();
                        close();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      theme="primary"
                      className="flex-grow"
                      onClick={() => {
                        handleApply();
                        close();
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default MoreFilters;
