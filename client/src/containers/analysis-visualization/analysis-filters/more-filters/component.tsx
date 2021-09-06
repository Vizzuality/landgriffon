import React, { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';

import Button from 'components/button';

type MoreFiltersProps = {
  filters: JSX.Element[];
};

const MoreFilters: React.FC<MoreFiltersProps> = ({ filters }: MoreFiltersProps) => {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setOpen(false);
  };

  return (
    <Popover>
      <Button theme="secondary" onClick={() => setOpen(!open)}>
        <span className="block h-5 truncate">
          <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
        </span>
        <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
          {filters.length}
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
                <Button
                  theme="textLight"
                  size="text"
                  onClick={() => console.log('clicked Clear all')}
                >
                  Clear all
                </Button>
              </div>
              {/* TODO: error, no `key` */}
              <div className="flex flex-col gap-3">{filters}</div>
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
