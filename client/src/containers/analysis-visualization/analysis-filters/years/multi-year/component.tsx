import React, { Fragment, useState, useCallback } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Select, SelectProps } from 'antd';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { toNumber, isFinite } from 'lodash';

import { MultiYearFilterProps } from './types';

const MultiYearFilter: React.FC<MultiYearFilterProps> = ({
  data,
  startValue,
  endValue,
  onChangeStartValue,
  onChangeEndValue,
}: MultiYearFilterProps) => {
  const [additionalYear, setAdditionalYear] = useState<number>(null);

  const onSearch: SelectProps<number>['onSearch'] = useCallback(
    (searchTerm) => {
      if (!isFinite(toNumber(searchTerm)) || toNumber(searchTerm) <= data[0]) {
        return;
      }

      const existsMatch = data.some((year) => `${year}`.includes(searchTerm));
      if (!existsMatch) {
        setAdditionalYear(toNumber(searchTerm));
      }
    },
    [data]
  );

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm">
            <span className="block h-5 truncate">
              <span className="mr-1 text-gray-600">from</span>
              <span>
                {startValue}-{endValue}
              </span>
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {open ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
              )}
            </span>
          </Popover.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Panel className="absolute z-20 mt-1 w-60">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative p-4 bg-white rounded-lg">
                  <div className="grid grid-cols-1 gap-2">
                    <div>From</div>
                    <Select
                      value={startValue}
                      dropdownStyle={{ minWidth: 'min-content' }}
                      suffixIcon={<ChevronDownIcon />}
                      showSearch
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      onChange={onChangeStartValue}
                    >
                      {data.map((year) => (
                        <Select.Option key={year} value={year} disabled={year >= endValue}>
                          <span>{year}</span>
                        </Select.Option>
                      ))}
                    </Select>
                    <div>To</div>
                    <Select
                      value={endValue}
                      suffixIcon={<ChevronDownIcon />}
                      showSearch
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      onSearch={onSearch}
                      onChange={onChangeEndValue}
                    >
                      {data.map((year) => (
                        <Select.Option key={year} value={year} disabled={year <= startValue}>
                          {year}
                        </Select.Option>
                      ))}
                      {additionalYear && (
                        <Select.Option
                          key={`additional-year-${additionalYear}`}
                          value={additionalYear}
                        >
                          {additionalYear}
                        </Select.Option>
                      )}
                    </Select>
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

export default MultiYearFilter;
