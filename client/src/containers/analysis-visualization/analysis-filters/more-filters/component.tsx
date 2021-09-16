import React, { Fragment, useCallback, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';

import { useAppDispatch } from 'store/hooks';
import { setFilters } from 'store/features/analysis';
import Button from 'components/button';

import type { AnalysisState } from 'store/features/analysis';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions';
import Suppliers from '../suppliers';

const INITIAL_FILTERS: Partial<AnalysisState['filters']> = {
  materials: [],
  origins: [],
  suppliers: [],
};

const MoreFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [moreFilters, setMoreFilters] = useState(INITIAL_FILTERS);

  const handleApply = () => {
    dispatch(
      setFilters({
        materials: moreFilters.materials,
        origins: moreFilters.origins,
        suppliers: moreFilters.suppliers,
      } as AnalysisState['filters'])
    );
    setOpen(false);
  };

  const handleClearFilters = useCallback(() => {
    setMoreFilters(INITIAL_FILTERS); // reset filters
  }, []);

  const handleChangeFilter = useCallback(
    // only save ids on store
    (key, values) =>
      setMoreFilters({ [key]: values.map(({ value }) => value) } as AnalysisState['filters']),
    []
  );

  return (
    <Popover className="relative">
      <Button theme="secondary" onClick={() => setOpen(!open)}>
        <span className="block h-5 truncate">
          <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
        </span>
        <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
          3
        </span>
      </Button>

      <Transition
        show={open}
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Popover.Panel static className="absolute right-0 z-10 mt-1 w-80">
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
                    className="w-full"
                    multiple
                    treeCheckable
                    onChange={(values) => handleChangeFilter('materials', values)}
                  />
                </div>
                <OriginRegions />
                <Suppliers />
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
