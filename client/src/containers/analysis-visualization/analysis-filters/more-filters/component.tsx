import React, { Fragment, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import classNames from 'classnames';

import { Popover, Transition } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import Button, { THEME } from 'components/button/component';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';
import Suppliers from '../suppliers/component';

import cx from 'classnames';

import type { AnalysisFiltersState } from 'store/features/analysis/filters';
import { useOutsideClick } from 'rooks';

const INITIAL_FILTERS: Partial<AnalysisFiltersState> = {
  materials: [],
  origins: [],
  suppliers: [],
};

const MoreFilters: React.FC = () => {
  const analysisState = useAppSelector(analysisFilters);
  const filters = useMemo(() => {
    const { materials, origins, suppliers } = analysisState;
    return { materials, origins, suppliers };
  }, [analysisState]);
  const dispatch = useAppDispatch();

  const [selectedFilters, setSelectedFilters] = useState(filters);
  const { materials, origins, suppliers } = selectedFilters;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [counter, setCounter] = useState<number>(0);

  const handleApply = useCallback(() => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch, selectedFilters]);

  const handleClearFilters = useCallback(() => {
    dispatch(setFilters(INITIAL_FILTERS));
  }, [dispatch]);

  const handleChangeFilter = useCallback((key, values) => {
    setSelectedFilters((filters) => ({ ...filters, [key]: values }));
  }, []);

  useEffect(() => {
    const counters = Object.values(filters).map((value) => value.length);
    const total = counters.reduce((a, b) => a + b);
    setCounter(total);
  }, [filters]);

  useEffect(() => {
    setSelectedFilters(filters);
  }, [filters, isPopoverOpen]);

  const filtersRef = useRef();

  useOutsideClick(
    filtersRef,
    (e) => {
      e.stopPropagation();
      setIsPopoverOpen(false);
    },
    isPopoverOpen,
  );

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button>
            <div
              onClick={() => {
                setIsPopoverOpen((open) => !open);
              }}
              className={classNames(THEME.secondary, 'flex p-2 rounded-md')}
            >
              <span className="block h-5 truncate">
                <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
              </span>
              {counter !== 0 && (
                <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
                  {counter}
                </span>
              )}
            </div>
          </Popover.Button>
          <Transition
            show={isPopoverOpen}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Panel
              static
              className="absolute md:right-0 lg:left-0 lg:clear-right-0 mt-1 w-80 z-20"
            >
              <div
                className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 "
                ref={filtersRef}
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
                        current={materials}
                        fitContent
                        onChange={(values) => handleChangeFilter('materials', values)}
                      />
                    </div>
                    <div>
                      <div className="mb-1">Origins</div>
                      <OriginRegions
                        multiple
                        withSourcingLocations
                        current={origins}
                        fitContent
                        onChange={(values) => handleChangeFilter('origins', values)}
                      />
                    </div>
                    <div>
                      <div className="mb-1">Suppliers</div>
                      <Suppliers
                        multiple
                        withSourcingLocations
                        current={suppliers}
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
