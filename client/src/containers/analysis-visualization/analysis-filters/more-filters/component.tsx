import React, { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';

import Button from 'components/button';

type MoreFiltersProps = {
  filters: React.FC[];
};

const MoreFilters: React.FC<MoreFiltersProps> = ({ filters }: MoreFiltersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover className="">
      <Button theme="secondary" onClick={() => setOpen(!open)}>
        <span className="block h-5 truncate">
          <FilterIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
        </span>
        <span className="flex justify-center items-center ml-1 w-5 h-5 text-xs text-white font-semibold rounded-full bg-green-700">
          {filters.length}
        </span>
      </Button>
      {open && (
        <button
          type="button"
          aria-label="close dropdown"
          className="fixed w-full h-full top-0 left-0 bg-transparent cursor-default"
          onClick={() => setOpen(!open)}
        />
      )}
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
              </div>
              {/* TODO: error, no `key` */}
              <div className="flex flex-col gap-3">{filters}</div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default MoreFilters;
