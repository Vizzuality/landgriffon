import React, { useRef, useEffect, useState, Fragment } from 'react';
import { useOutsideClick } from 'rooks';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

import Select from 'components/select';
import type { SelectOption } from 'components/select/types';

import { YearsRangeFilterProps } from './types';

export const YearsRangeFilter: React.FC<YearsRangeFilterProps> = ({
  startYear,
  endYear,
  years,
  fiveYearGap = false,
  onChange,
}: YearsRangeFilterProps) => {
  const wrapperRef = useRef();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [startYearOptions, setStartYearOptions] = useState<SelectOption[]>();
  const [startYearOption, setStartYearOption] = useState<SelectOption>();
  const [endYearOptions, setEndYearOptions] = useState<SelectOption[]>();
  const [endYearOption, setEndYearOption] = useState<SelectOption>();

  useEffect(() => {
    if (!years.length) return;

    setStartYearOptions(
      years?.map((year) => ({
        label: year.toString(),
        value: year,
        disabled: fiveYearGap && endYear <= year + 4,
      })),
    );

    setEndYearOptions(
      years?.map((year) => ({
        label: year.toString(),
        value: year,
        disabled: fiveYearGap && year - 4 <= startYear,
      })),
    );

    setIsLoaded(true);
  }, [endYear, fiveYearGap, isLoaded, startYear, years]);

  useEffect(() => {
    if (!startYearOptions || !endYearOptions) return;
    setStartYearOption(startYearOptions.find((option) => option.value === startYear));
    setEndYearOption(endYearOptions.find((option) => option.value === endYear));
  }, [startYearOptions, endYearOptions, startYear, endYear]);

  useEffect(() => {
    if (!startYearOption || !endYearOption) return;
    // Prevents `onChange` to be called when this component loads, possibly causing a loop.
    if (startYear === startYearOption.value && endYear === endYearOption.value) return;
    onChange({ startYear: Number(startYearOption.value), endYear: Number(endYearOption.value) });
  }, [
    startYear,
    endYear,
    onChange,
    startYearOption,
    endYearOption,
    startYearOptions,
    endYearOptions,
  ]);

  useOutsideClick(wrapperRef, () => {
    setIsOpen(false);
  });

  // Prevent display when not loaded
  if (!isLoaded) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span className="block h-5 truncate">
          <span className="mr-1 text-gray-600">from</span>
          <span>
            {startYearOption?.label} - {endYearOption?.label}
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
          )}
        </span>
      </button>
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="absolute z-20 mt-1 w-60">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="relative p-4 bg-white rounded-lg">
              <div className="grid grid-cols-1 gap-2">
                <div>From</div>
                <Select
                  loading={false}
                  showSearch={false}
                  options={startYearOptions}
                  current={startYearOption}
                  onChange={setStartYearOption}
                />
                <div>To</div>
                <Select
                  loading={false}
                  showSearch={true}
                  options={endYearOptions}
                  current={endYearOption}
                  onChange={setEndYearOption}
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default YearsRangeFilter;
