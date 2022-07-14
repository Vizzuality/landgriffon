import React, { useEffect, useState, Fragment, useMemo } from 'react';
import { Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';
import cx from 'classnames';

import Select from 'components/select';
import type { SelectOption } from 'components/select/types';

import { YearsRangeFilterProps } from './types';
import {
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react-dom-interactions';

export const YearsRangeFilter: React.FC<YearsRangeFilterProps> = ({
  startYear,
  endYear,
  years,
  loading = false,
  yearsGap = 0,
  showStartYearSearch = false,
  showEndYearSearch = true,
  showSearch,
  onChange = () => null,
  onStartYearSearch = () => null,
  onEndYearSearch = () => null,
  lastYearWithData,
}) => {
  const startYearOption = useMemo(() => ({ label: `${startYear}`, value: startYear }), [startYear]);
  const endYearOption = useMemo(() => ({ label: `${endYear}`, value: endYear }), [endYear]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [startYearOptions, setStartYearOptions] = useState<SelectOption[]>();
  const [endYearOptions, setEndYearOptions] = useState<SelectOption[]>();

  useEffect(() => {
    if (!years.length) return;
    const filteredYears = years.filter((y) => y <= lastYearWithData);
    setStartYearOptions(
      filteredYears?.map((year) => ({
        label: year.toString(),
        value: year,
        disabled: endYear <= year + (yearsGap - 1),
      })),
    );

    setEndYearOptions(
      years?.map((year) => ({
        label: year.toString(),
        value: year,
        disabled: startYear >= year - (yearsGap - 1),
      })),
    );

    setIsLoaded(true);
  }, [endYear, isLoaded, startYear, years, yearsGap, lastYearWithData]);

  useEffect(() => {
    if (!startYearOption || !endYearOption) return;
    if (startYear === startYearOption.value && endYear === endYearOption.value) return;
    onChange?.({ startYear: Number(startYearOption.value), endYear: Number(endYearOption.value) });
  }, [
    startYear,
    endYear,
    startYearOptions,
    endYearOption,
    endYearOptions,
    onChange,
    startYearOption,
  ]);

  const { reference, floating, x, y, context, strategy } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 }), flip()],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  // Prevent display when not loaded
  if (!isLoaded) return null;

  return (
    <div>
      <button
        {...getReferenceProps({
          ref: reference,
        })}
        className="relative w-full py-2 pl-3 pr-10 text-left bg-white border min-h-[2.5rem] border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
      >
        <span className="block h-5 truncate">
          <span className="mr-1 text-gray-600">from</span>
          <span>
            {startYearOption?.label} - {endYearOption?.label}
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronUpIcon
            className={cx('w-5 h-5 text-gray-900', {
              'rotate-180': isOpen,
            })}
            aria-hidden="true"
          />
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
        {...getFloatingProps({
          ref: floating,
          style: {
            top: y ?? '',
            left: x ?? '',
            position: strategy,
          },
        })}
      >
        <div className="absolute z-20 mt-1 w-60">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="relative p-4 bg-white rounded-lg">
              <div className="grid grid-cols-1 gap-2">
                <div>From</div>
                <Select
                  numeric
                  hideValueWhenMenuOpen
                  loading={loading}
                  showSearch={showSearch ?? showStartYearSearch}
                  options={startYearOptions}
                  current={startYearOption}
                  onChange={({ value }) => {
                    onChange?.({ startYear: Number(value), endYear });
                  }}
                  onSearch={onStartYearSearch}
                  placeholder="Type any year"
                />
                <div>To</div>
                <Select
                  numeric
                  hideValueWhenMenuOpen
                  loading={loading}
                  showSearch={showSearch ?? showEndYearSearch}
                  options={endYearOptions.map((option) => ({
                    ...option,
                    extraInfo:
                      lastYearWithData && option.value > lastYearWithData
                        ? 'projected data'
                        : undefined,
                  }))}
                  current={endYearOption}
                  onChange={({ value }) => {
                    onChange?.({ startYear, endYear: Number(value) });
                  }}
                  onSearch={onEndYearSearch}
                  placeholder="Type any year"
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
