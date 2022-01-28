import React, { useCallback, useEffect, useState, useMemo, Fragment } from 'react';
import { toNumber, isFinite } from 'lodash';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { useYears } from 'hooks/years';

import Select from 'components/select';

import type { SelectProps, SelectOptions, SelectOption } from 'components/select/types';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { visualizationMode, filters, layer } = useAppSelector(analysis);
  const { startYear, endYear, materials, indicator } = filters;
  const [additionalYear, setAdditionalYear] = useState<number>(null);

  const { data, isLoading } = useYears(layer, materials, indicator);

  const dataWithAdditionalYear: number[] = useMemo(() => {
    const result = [...(data || [])];
    if (additionalYear) result.push(additionalYear);
    return result;
  }, [data, additionalYear]);

  const handleAdditionalYear: SelectProps['onSearch'] = useCallback(
    (searchTerm) => {
      if (!isFinite(toNumber(searchTerm)) || toNumber(searchTerm) <= data[0]) {
        return;
      }

      const existsMatch = data.some((year) => `${year}`.includes(searchTerm));
      if (!existsMatch) {
        setAdditionalYear(toNumber(searchTerm));
      }
    },
    [data],
  );

  const onChangeStartYear = useCallback(
    (selected) => {
      dispatch(
        setFilter({
          id: 'startYear',
          value: selected.value,
        }),
      );
    },
    [dispatch],
  );

  const onChangeEndYear = useCallback(
    (selected) => {
      dispatch(
        setFilter({
          id: 'endYear',
          value: selected.value,
        }),
      );
    },
    [dispatch],
  );

  const optionsStartYear: SelectOptions = useMemo(
    () =>
      data?.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [data],
  );

  const optionsEndYear: SelectOptions = useMemo(() => {
    const result = [...(data || [])];
    if (additionalYear) result.push(additionalYear);
    return result.map((year) => ({
      label: year.toString(),
      value: year,
    }));
  }, [data, additionalYear]);

  const currentStartYearValue: SelectOption = useMemo(
    () => optionsStartYear?.find((option) => option.value === startYear),
    [optionsStartYear, startYear],
  );

  const currentEndYearValue: SelectOption = useMemo(
    () => optionsEndYear?.find((option) => option.value === endYear),
    [endYear, optionsEndYear],
  );

  const handleToggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  useEffect(() => {
    if (!isLoading && dataWithAdditionalYear) {
      onChangeStartYear({
        value: startYear
          ? dataWithAdditionalYear.find((year) => year === startYear) ?? dataWithAdditionalYear[0]
          : dataWithAdditionalYear[0],
      });
      onChangeEndYear({
        value: endYear
          ? dataWithAdditionalYear.find((year) => year === endYear) ??
            dataWithAdditionalYear?.[dataWithAdditionalYear.length - 1]
          : dataWithAdditionalYear?.[dataWithAdditionalYear.length - 1],
      });
    }
  }, [
    dataWithAdditionalYear,
    isLoading,
    layer,
    materials,
    indicator,
    onChangeStartYear,
    onChangeEndYear,
    startYear,
    endYear,
  ]);

  if (visualizationMode === 'map') {
    return (
      <Select
        loading={isLoading}
        current={currentEndYearValue}
        options={optionsEndYear}
        placeholder="Year"
        showSearch
        onChange={onChangeEndYear}
        onSearch={handleAdditionalYear}
      />
    );
  }

  return (
    <div className="relative">
      <button
        className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 sm:text-sm"
        onClick={handleToggleOpen}
      >
        <span className="block h-5 truncate">
          <span className="mr-1 text-gray-600">from</span>
          <span>
            {currentStartYearValue?.label}-{currentEndYearValue?.label}
          </span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {open ? (
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
                  loading={isLoading}
                  current={currentStartYearValue}
                  options={optionsStartYear}
                  showSearch={false}
                  onChange={onChangeStartYear}
                  onSearch={handleAdditionalYear}
                />
                <div>To</div>
                <Select
                  loading={isLoading}
                  current={currentEndYearValue}
                  options={optionsEndYear}
                  showSearch
                  searchPlaceholder="Search or add a year"
                  onChange={onChangeEndYear}
                  onSearch={handleAdditionalYear}
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default YearsFilter;
