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
} from '@floating-ui/react-dom-interactions';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

import Select from 'components/select';

import type { SelectOption } from 'components/select/types';
import type { YearsRangeFilterProps } from './types';

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
  placeholderFrom = 'Type any year',
  placeholderTo = 'Type any year',
}) => {
  const startYearOption = useMemo(() => ({ label: `${startYear}`, value: startYear }), [startYear]);
  const endYearOption = useMemo(() => ({ label: `${endYear}`, value: endYear }), [endYear]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [startYearOptions, setStartYearOptions] = useState<SelectOption<number>[]>();
  const [endYearOptions, setEndYearOptions] = useState<SelectOption<number>[]>();

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
        type="button"
        className="relative w-full py-2.5 leading-5 text-sm pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-pointer focus:outline-none focus:border-navy-400 focus:ring-0"
        {...getReferenceProps({
          ref: reference,
        })}
      >
        <span className="block h-5 truncate">
          <span className="mr-2 text-gray-400">from</span>
          <span>
            {startYearOption?.label} - {endYearOption?.label}
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon
            className={cx('w-5 h-5 text-gray-900', {
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
            ref: floating,
            style: {
              top: y ?? '',
              left: x ?? '',
              position: strategy,
            },
          })}
        >
          <div className="mt-1 w-60">
            <div className="p-4 bg-white rounded-md shadow-md ring-1 ring-gray-200">
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
                  placeholder={placeholderFrom}
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
                  placeholder={placeholderTo}
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
