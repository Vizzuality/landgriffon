import { Fragment, useState } from 'react';
import { Select } from 'antd';
import { Popover, Transition, Listbox, RadioGroup } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

const availableYears = [
  {
    id: '2019',
    name: '2019',
    disabled: false,
    projected: false,
  },
  {
    id: '2020',
    name: '2020',
    disabled: false,
    projected: false,
  },
  {
    id: '2021',
    name: '2021',
    disabled: false,
    projected: true,
  },
  {
    id: '2022',
    name: '2022',
    disabled: false,
    projected: true,
  },
  {
    id: '2023',
    name: '2023',
    disabled: false,
    projected: true,
  },
];


function handleChange(value) {
  console.log(`selected ${value}`);
}

const YearsFilter = () => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm">
            {/* TODO: Dynamic title */}
            <span className="block truncate">AÑOZ</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {open ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
              )}
            </span>
          </Popover.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Panel className="absolute w-60 z-10 mt-1">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative rounded-lg bg-white p-4">
                  <div className="text-sm text-gray-500">Year</div>
                  <Select
                    defaultValue={availableYears[0].id}
                    // TODO: onChange
                    onChange={handleChange}
                    className='w-full'
                  >
                    {availableYears.map((year) =>
                      <Select.Option
                        key={year.id}
                        value={year.id}
                      >
                        <span>{year.name}</span>
                        {year.projected &&
                          <span>projected year</span>
                        }
                      </Select.Option>
                    )}
                  </Select>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default YearsFilter;