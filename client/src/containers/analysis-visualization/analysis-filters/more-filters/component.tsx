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
    console.log('clicked Apply');
    setOpen(false);
  };

  return (
    <Popover>
      <Button theme="secondary" onClick={() => setOpen(true)}>
        <span className="block h-5 truncate">
          <FilterIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
        </span>
        <span className="flex justify-center items-center ml-1 w-5 h-5 text-xs text-white font-semibold rounded-full bg-green-700">
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
        <Popover.Panel static className="absolute w-80 z-10 mt-1 right-0">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="relative rounded-lg bg-white p-4">
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
