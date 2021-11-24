import React, { Fragment, useState, useCallback, useMemo } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { toNumber, isFinite } from 'lodash';

import Select from 'components/select';

import type { SelectOption, SelectOptions, SelectProps } from 'components/select/types';
import type { MultiYearFilterProps } from './types';

const MultiYearFilter: React.FC<MultiYearFilterProps> = ({
  data,
  startValue,
  endValue,
  onChangeStartValue,
  onChangeEndValue,
  onSearch,
}: MultiYearFilterProps) => {

  const handleStartYearChange: SelectProps['onChange'] = useCallback(
    (selected) => onChangeStartValue(selected.value as number),
    [onChangeStartValue],
  );

  const handleEndYearChange: SelectProps['onChange'] = useCallback(
    (selected) => onChangeEndValue(selected.value as number),
    [onChangeEndValue],
  );

  const optionsStartYear: SelectOptions = useMemo(
    () =>
      data.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [data],
  );

  const optionsEndYear: SelectOptions = useMemo(() => {
    const result = [...data];
    if (additionalYear) result.push(additionalYear);
    return result.map((year) => ({
      label: year.toString(),
      value: year,
    }));
  }, [data, additionalYear]);

  const currentStartYearValue: SelectOption = useMemo(
    () => optionsStartYear.find((option) => option.value === startValue),
    [optionsStartYear, startValue],
  );

  const currentEndYearValue: SelectOption = useMemo(
    () => optionsEndYear.find((option) => option.value === endValue),
    [optionsEndYear, endValue],
  );

  console.log('endValue', endValue);
  console.log('currentEndYearValue', currentEndYearValue);

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
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-20 mt-1 w-60">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative p-4 bg-white rounded-lg">
                  <div className="grid grid-cols-1 gap-2">
                    <div>From</div>
                    <Select
                      current={currentStartYearValue}
                      showSearch={false}
                      options={optionsStartYear}
                      onChange={handleStartYearChange}
                    />
                    <div>To</div>
                    <Select
                      current={currentEndYearValue}
                      options={optionsEndYear}
                      showSearch
                      onSearch={onSearch}
                      onChange={handleEndYearChange}
                    />
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
