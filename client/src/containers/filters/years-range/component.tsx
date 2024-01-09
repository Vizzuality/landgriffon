import cx from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import {
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

import Select from 'components/forms/select/autocomplete';

import type { Option } from 'components/forms/select';
import type { YearsRangeFilterProps } from './types';

export const YearsRangeFilter: React.FC<YearsRangeFilterProps> = ({
  startYear,
  endYear,
  years,
  loading = false,
  yearsGap = 0,
  // showStartYearSearch = false,
  // showEndYearSearch = true,
  // showSearch,
  onChange = () => null,
  // onStartYearSearch = () => null,
  onEndYearSearch = () => null,
  lastYearWithData,
  placeholderFrom = 'Type any year',
  placeholderTo = 'Type any year',
}) => {
  const startYearOption = useMemo(() => ({ label: `${startYear}`, value: startYear }), [startYear]);
  const endYearOption = useMemo(() => ({ label: `${endYear}`, value: endYear }), [endYear]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [startYearOptions, setStartYearOptions] = useState<Option<number>[]>();
  const [endYearOptions, setEndYearOptions] = useState<Option<number>[]>();

  useEffect(() => {
    if (!years.length) return;
    const filteredYears = lastYearWithData ? years.filter((y) => y <= lastYearWithData) : years;
    setStartYearOptions(
      filteredYears?.map((year) => ({
        label: year.toString(),
        value: year,
        disabled: endYear <= year + (yearsGap - 1),
      })),
    );

    setEndYearOptions(
      years?.map((year) => ({
        label:
          lastYearWithData && year > lastYearWithData
            ? `${year} - projected data`
            : year.toString(),
        value: year,
        disabled: startYear >= year - (yearsGap - 1),
      })),
    );
    setIsLoaded(true);
  }, [endYear, isLoaded, startYear, years, yearsGap, lastYearWithData]);

  const { refs, x, y, context, strategy } = useFloating({
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
        type="button"
        className="relative w-full cursor-pointer rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-left text-sm leading-5 shadow-sm focus:border-navy-400 focus:outline-none focus:ring-0"
        {...getReferenceProps({
          ref: refs.setReference,
        })}
        data-testid="years-range-btn"
      >
        <span className="block h-5 truncate">
          <span className="mr-2 text-gray-400">from</span>
          <span>
            {startYearOption?.label} - {endYearOption?.label}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon
            className={cx('h-5 w-5 text-gray-900', {
              'rotate-180': isOpen,
            })}
            aria-hidden="true"
          />
        </span>
      </button>
      <FloatingPortal>
        <Transition
          as="div"
          show={isOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
          className="z-10"
          {...getFloatingProps({
            ref: refs.setFloating,
            style: {
              top: y ?? '',
              left: x ?? '',
              position: strategy,
            },
          })}
        >
          <div className="mt-1 w-60">
            <div className="rounded-md bg-white p-4 shadow-md ring-1 ring-gray-200">
              <div className="grid grid-cols-1 gap-2">
                <div>From</div>
                <Select<number>
                  loading={loading}
                  options={startYearOptions}
                  value={startYearOption}
                  onChange={({ value }) => onChange?.({ startYear: value, endYear })}
                  placeholder={placeholderFrom}
                  data-testid="year-selector-from"
                />
                <div>To</div>
                <Select<number>
                  loading={loading}
                  options={endYearOptions}
                  value={endYearOption}
                  onChange={({ value }) => onChange?.({ startYear, endYear: value })}
                  placeholder={placeholderTo}
                  onSearch={onEndYearSearch}
                  data-testid="year-selector-to"
                />
              </div>
            </div>
          </div>
        </Transition>
      </FloatingPortal>
    </div>
  );
};

export default YearsRangeFilter;
