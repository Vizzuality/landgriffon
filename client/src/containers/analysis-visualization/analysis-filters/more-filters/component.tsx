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

const INITIAL_FILTERS: Partial<AnalysisFiltersState> = {
  materials: [],
  origins: [],
  suppliers: [],
};

const MoreFilters: React.FC = () => {
  const filters = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const { materials, origins, suppliers } = filters;
  const selectedFilters = useMemo(
    () => ({ materials, origins, suppliers }),
    [materials, origins, suppliers],
  );

  // const [open, setOpen] = useState(false);
  const [moreFilters, setMoreFilters] = useState(selectedFilters);
  const [counter, setCounter] = useState<number>(0);

  const handleApply = useCallback(() => {
    dispatch(
      setFilters({
        materials: moreFilters.materials || INITIAL_FILTERS.materials,
        origins: moreFilters.origins || INITIAL_FILTERS.origins,
        suppliers: moreFilters.suppliers || INITIAL_FILTERS.suppliers,
      } as AnalysisFiltersState),
    );
    // setOpen(false);
  }, [dispatch, moreFilters]);

  const handleClearFilters = useCallback(() => {
    setMoreFilters(INITIAL_FILTERS as AnalysisFiltersState); // reset filters
  }, []);

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

  useEffect(() => {
    const counters = Object.keys(selectedFilters).map((key) => selectedFilters[key].length);
    const total = counters.reduce((a, b) => a + b);
    setCounter(total);
  }, [selectedFilters]);

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button className={classNames(THEME.secondary, 'flex p-2 rounded-md')}>
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
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Panel
              static
              className="absolute md:right-0 lg:left-0 lg:clear-right-0 mt-1 w-80 z-20"
            >
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
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
                        current={moreFilters.materials}
                        fitContent
                        onChange={(values) => handleChangeFilter('materials', values)}
                      />
                    </div>
                    <div>
                      <div className="mb-1">Origins</div>
                      <OriginRegions
                        multiple
                        withSourcingLocations
                        current={moreFilters.origins}
                        fitContent
                        onChange={(values) => handleChangeFilter('origins', values)}
                      />
                    </div>
                    <div>
                      <div className="mb-1">Suppliers</div>
                      <Suppliers
                        multiple
                        withSourcingLocations
                        current={moreFilters.suppliers}
                        fitContent
                        onChange={(values) => handleChangeFilter('suppliers', values)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button theme="secondary" className="px-9" onClick={() => close()}>
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
